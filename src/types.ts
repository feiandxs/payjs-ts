// src/types.ts

export interface PayJSNativeRequest {
  mchid: string;
  total_fee: number;
  out_trade_no: string;
  body?: string;
  attach?: string;
  notify_url?: string;
  type?: string;
}

export interface PayJSNativeResponse {
  return_code: number;
  return_msg: string;
  payjs_order_id: string;
  out_trade_no: string;
  total_fee: number;
  code_url: string;
  qrcode: string;
  sign: string;
}


export interface PayJSMicropayRequest {
  mchid: string;
  total_fee: number;
  out_trade_no: string;
  auth_code: string;  // 扫码支付授权码
  body?: string;
  attach?: string;
}

export interface PayJSMicropayResponse {
  return_code: number;
  msg?: string;
  return_msg: string;
  payjs_order_id: string;
  out_trade_no: string;
  total_fee: number;
  sign: string;
}

export interface PayJSCashierRequest {
  mchid: string;
  total_fee: number;
  out_trade_no: string;
  body?: string;
  attach?: string;
  notify_url?: string;
  callback_url?: string;
  auto?: boolean;
  hide?: boolean;
  logo?: string;
}

export interface PayJSCashierErrorResponse {
  return_code: 0;
  status: 0;
  msg: string;
  return_msg: string;
}