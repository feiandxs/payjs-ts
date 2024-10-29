```markdown
# PayJS TypeScript SDK

一个为 PayJS 支付服务开发的 TypeScript SDK，提供完整的类型支持和简单易用的 API。

## 特性

- 完整的 TypeScript 类型支持
- 支持扫码支付、付款码支付和收银台支付
- 简单清晰的 API 设计
- 内置签名算法
- 符合 PayJS 官方接口规范

## 安装

```bash
npm install payjs-ts
```

或者

```bash
yarn add payjs-ts
```

## 快速开始

```typescript
import PayJS from 'payjs-ts';

// 初始化
const payjs = new PayJS('your-mchid', 'your-key');

// 扫码支付示例
async function nativePayment() {
  const result = await payjs.native({
    total_fee: 100,              // 金额（分）
    out_trade_no: 'order123',    // 订单号
    body: '商品标题'             // 商品标题
  });
  
  console.log(result.qrcode);    // 支付二维码链接
  console.log(result.payjs_order_id);  // PayJS 订单号
}

// 付款码支付示例
async function micropayment() {
  try {
    const result = await payjs.micropay({
      total_fee: 100,
      out_trade_no: 'order123',
      body: '商品标题',
      auth_code: '134567890123456789'  // 扫码支付授权码
    });
    
    console.log(result.payjs_order_id);
  } catch (error) {
    console.error('支付失败:', error);
  }
}

// 收银台支付示例
function cashierPayment() {
  const cashierUrl = payjs.cashier({
    total_fee: 100,
    out_trade_no: 'order123',
    body: '商品标题',
    callback_url: 'https://your-domain.com/callback',  // 支付成功后的跳转地址
    notify_url: 'https://your-domain.com/notify'       // 异步通知地址
  });
  
  // 跳转到收银台页面
  window.location.href = cashierUrl;
}
```

## API 文档

### 初始化

```typescript
const payjs = new PayJS(mchid: string, key: string);
```

### 扫码支付 (native)

```typescript
interface PayJSNativeRequest {
  total_fee: number;      // 金额（分）
  out_trade_no: string;   // 用户端订单号
  body?: string;          // 订单标题
  attach?: string;        // 用户自定义数据
  notify_url?: string;    // 异步通知地址
}

const result = await payjs.native(params: PayJSNativeRequest);
```

### 付款码支付 (micropay)

```typescript
interface PayJSMicropayRequest {
  total_fee: number;      // 金额（分）
  out_trade_no: string;   // 用户端订单号
  body?: string;          // 订单标题
  attach?: string;        // 用户自定义数据
  auth_code: string;      // 扫码支付授权码
  notify_url?: string;    // 异步通知地址
}

const result = await payjs.micropay(params: PayJSMicropayRequest);
```

### 收银台支付 (cashier)

```typescript
interface PayJSCashierRequest {
  total_fee: number;      // 金额（分）
  out_trade_no: string;   // 用户端订单号
  body?: string;          // 订单标题
  attach?: string;        // 用户自定义数据
  notify_url?: string;    // 异步通知地址
  callback_url?: string;  // 用户支付成功后，前端跳转地址
  auto?: boolean;         // 自动提交
  hide?: boolean;         // 隐藏收银台背景
}

const url = payjs.cashier(params: PayJSCashierRequest);
```

## 错误处理

SDK 会在以下情况抛出错误：

- 付款码格式不正确
- 支付失败
- 网络请求失败
- 参数验证失败

建议使用 try-catch 进行错误处理：

```typescript
try {
  const result = await payjs.micropay({
    // ...支付参数
  });
} catch (error) {
  console.error('支付失败:', error.message);
}
```

## 类型支持

该 SDK 导出了所有支付相关的类型定义：

```typescript
import {
  PayJSNativeRequest,
  PayJSNativeResponse,
  PayJSMicropayRequest,
  PayJSMicropayResponse,
  PayJSCashierRequest,
  PayJSCashierErrorResponse
} from 'payjs-ts';
```

## 环境要求

- Node.js >= 14.0.0
- TypeScript >= 4.5.0 (如果在 TypeScript 项目中使用)

## 许可证

MIT

## 贡献指南

欢迎提交 Issue 和 Pull Request。
