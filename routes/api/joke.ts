import { HandlerContext } from "$fresh/server.ts";
import Authenticator from 'npm:claude-api@1.0.4';

async function askCluadeAPi(question, conversationId) {
  const token = Deno.env.get("token");
  const bot = Deno.env.get("bot");
  // 频道的名字(可以是不存在的频道, 如果是已存在的频道必须添加了 Claude)
  const chatId = Deno.env.get("chatId");

  // 初始化claude
  const claudeClient = new Authenticator(token, bot);

  // 创建频道并返回房间ID：channel
  const channel = await claudeClient.newChannel(chatId);

  let result;
  if (conversationId) {
    result = await claudeClient.sendMessage({
      text: question,
      channel,
      conversationId,
      onMessage: (originalMessage) => {
        console.log('loading', originalMessage);
      },
    });
  } else {
    result = await claudeClient.sendMessage({
      text: question,
      channel,
      onMessage: (originalMessage) => {
        // console.log("loading", originalMessage)
        console.log('loading', originalMessage);
      },
    });
  }
  console.log('success', result);

  return {
    status: 0,
    data: {
      text: result.text,
      conversationId: result.conversationId,
    },
    message: 'success',
  };
}

export const handler = async (_req: Request, _ctx: HandlerContext): Response => {
  const url = new URL(_req.url);
  console.log("Path:", url.pathname);
  console.log("Query parameters:", url.searchParams);
  const question = url.searchParams.get('question');
  const conversationId = url.searchParams.get('conversationId');

  let result = {};
  try {
    result = await askCluadeAPi(question, conversationId);
  } catch (error) {
    result = {
      status: 1,
      data: null,
      message: `调用 AI 接口失败: ${error.message}`,
    };
  }

  return new Response(JSON.stringify(result));
};
