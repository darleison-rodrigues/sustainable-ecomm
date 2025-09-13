export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/eco-tip") {
      const { prompt } = await request.json();

      const response = await env.AI.run("@cf/meta/llama-2-7b-chat-int8", {
        prompt,
      });

      return Response.json(response);
    }

    if (url.pathname.startsWith("/api/")) {
      return Response.json({
        name: "Cloudflare",
      });
    }

    return new Response(null, { status: 404 });
  },
};
