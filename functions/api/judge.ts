interface Env {
  JUDGE0_URL?: string;
  JUDGE0_KEY?: string;
}

export function utf8ToBase64(str: string): string {
  if (!str) return '';
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToUtf8(b64: string | null | undefined): string {
  if (!b64) return '';
  try {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return b64;
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Judge0-Url, X-Judge0-Key',
    },
  });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const body = (await request.json()) as Record<string, any>;

    // Priority: Header > Body > Cloudflare Env > Default Public CE
    const targetUrl = (
      request.headers.get('X-Judge0-Url') ||
      body.judge0Url ||
      env.JUDGE0_URL ||
      'https://ce.judge0.com'
    ).replace(/\/+$/, '');

    const apiKey = (
      request.headers.get('X-Judge0-Key') ||
      body.judge0Key ||
      env.JUDGE0_KEY ||
      ''
    );

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      if (targetUrl.includes('rapidapi.com')) {
        headers['X-RapidAPI-Key'] = apiKey;
        headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
      } else {
        headers['X-Auth-Token'] = apiKey;
      }
    }

    // --- Action 1: Create Batch Submissions ---
    if (body.action === 'create_batch' && Array.isArray(body.submissions)) {
      const batchPayload = {
        submissions: body.submissions.map((sub: any) => ({
          source_code: sub.is_base64 ? sub.source_code : utf8ToBase64(sub.source_code || ''),
          language_id: sub.language_id,
          stdin: sub.is_base64 ? sub.stdin : utf8ToBase64(sub.stdin || ''),
          cpu_time_limit: Math.max(0.5, sub.cpu_time_limit ? Number((sub.cpu_time_limit / 1000).toFixed(2)) : 2.0),
          memory_limit: Math.max(16384, sub.memory_limit ? Math.round(sub.memory_limit * 1024) : 262144),
          ...(sub.expected_output
            ? { expected_output: sub.is_base64 ? sub.expected_output : utf8ToBase64(sub.expected_output) }
            : {}),
        })),
      };

      const apiUrl = `${targetUrl}/submissions/batch?base64_encoded=true`;
      const judge0Res = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(batchPayload),
      });

      if (!judge0Res.ok) {
        let errDetail = '';
        try {
          const errJson = await judge0Res.json();
          errDetail = JSON.stringify(errJson);
        } catch {
          errDetail = await judge0Res.text();
        }
        return new Response(
          JSON.stringify({ error: `Judge0 Batch API error (${judge0Res.status}): ${errDetail}`, status: judge0Res.status }),
          { status: judge0Res.status, headers: corsHeaders }
        );
      }

      const tokensData = await judge0Res.json();
      return new Response(JSON.stringify(tokensData), { status: 200, headers: corsHeaders });
    }

    // --- Action 2: Poll Batch Submissions ---
    if (body.action === 'poll_batch' && Array.isArray(body.tokens)) {
      const tokenList = body.tokens.join(',');
      const apiUrl = `${targetUrl}/submissions/batch?tokens=${encodeURIComponent(tokenList)}&base64_encoded=true&fields=token,status,time,memory,stdout,stderr,compile_output,message`;
      const judge0Res = await fetch(apiUrl, {
        method: 'GET',
        headers,
      });

      if (!judge0Res.ok) {
        let errDetail = await judge0Res.text();
        return new Response(
          JSON.stringify({ error: `Judge0 Batch Poll error (${judge0Res.status}): ${errDetail}` }),
          { status: judge0Res.status, headers: corsHeaders }
        );
      }

      const data = (await judge0Res.json()) as Record<string, any>;
      if (Array.isArray(data.submissions)) {
        for (const sub of data.submissions) {
          if (sub.stdout !== undefined && sub.stdout !== null) sub.stdout = base64ToUtf8(sub.stdout);
          if (sub.stderr !== undefined && sub.stderr !== null) sub.stderr = base64ToUtf8(sub.stderr);
          if (sub.compile_output !== undefined && sub.compile_output !== null) sub.compile_output = base64ToUtf8(sub.compile_output);
          if (sub.message !== undefined && sub.message !== null) sub.message = base64ToUtf8(sub.message);
          sub.is_decoded = true;
        }
      }

      return new Response(JSON.stringify(data), { status: 200, headers: corsHeaders });
    }

    // --- Action 3: Single Submission (Default) ---
    // Ensure source code and stdin are base64 encoded to prevent UTF-8 conversion errors on Judge0
    const sourceCodeB64 = body.is_base64
      ? body.source_code
      : utf8ToBase64(body.source_code || '');

    const stdinB64 = body.is_base64
      ? (body.stdin || '')
      : utf8ToBase64(body.stdin || '');

    // Build Judge0 submission payload with base64 encoding enabled
    const submissionPayload: Record<string, any> = {
      source_code: sourceCodeB64,
      language_id: body.language_id,
      stdin: stdinB64,
      cpu_time_limit: Math.max(0.5, body.cpu_time_limit ? Number((body.cpu_time_limit / 1000).toFixed(2)) : 2.0),
      memory_limit: Math.max(16384, body.memory_limit ? Math.round(body.memory_limit * 1024) : 262144),
    };

    if (body.expected_output) {
      submissionPayload.expected_output = body.is_base64
        ? body.expected_output
        : utf8ToBase64(body.expected_output);
    }

    // Always use base64_encoded=true to avoid HTTP 400 UTF-8 conversion errors on Judge0
    const apiUrl = `${targetUrl}/submissions?base64_encoded=true&wait=true`;

    const judge0Res = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(submissionPayload),
    });

    if (!judge0Res.ok) {
      let errDetail = '';
      try {
        const errJson = await judge0Res.json();
        errDetail = JSON.stringify(errJson);
      } catch {
        errDetail = await judge0Res.text();
      }

      return new Response(
        JSON.stringify({
          error: `Judge0 API error (${judge0Res.status}): ${errDetail}`,
          status_id: 13,
        }),
        { status: judge0Res.status, headers: corsHeaders }
      );
    }

    const data = await judge0Res.json() as Record<string, any>;

    // Decode base64 outputs back to clean UTF-8 strings
    if (data.stdout !== undefined && data.stdout !== null) {
      data.stdout = base64ToUtf8(data.stdout);
    }
    if (data.stderr !== undefined && data.stderr !== null) {
      data.stderr = base64ToUtf8(data.stderr);
    }
    if (data.compile_output !== undefined && data.compile_output !== null) {
      data.compile_output = base64ToUtf8(data.compile_output);
    }
    if (data.message !== undefined && data.message !== null) {
      data.message = base64ToUtf8(data.message);
    }
    data.is_decoded = true;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal proxy error' }),
      { status: 500, headers: corsHeaders }
    );
  }
}
