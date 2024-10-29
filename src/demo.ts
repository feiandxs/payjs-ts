import dotenv from 'dotenv';
import PayJS from './payjs';

dotenv.config();

const { PAYJS_MCHID, PAYJS_KEY } = process.env;

if (!PAYJS_MCHID || !PAYJS_KEY) {
  throw new Error('Missing PAYJS_MCHID or PAYJS_KEY in environment variables');
}

async function main() {
  const payjs = new PayJS(PAYJS_MCHID || '', PAYJS_KEY || '');

  try {
    const result = await payjs.native({
      total_fee: 100,  // 1元（单位：分）
      out_trade_no: `order_${Date.now()}`,
      body: '测试商品'
    });

    console.log({
      return_code: result.return_code,
      return_msg: result.return_msg,
      payjs_order_id: result.payjs_order_id,
      code_url: result.code_url,
      qrcode: result.qrcode
    });
  } catch (error) {
    console.error('支付请求失败:', error);
  }
}

main().catch(console.error);