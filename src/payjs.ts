import CryptoJS from 'crypto-js';
import {
  PayJSNativeRequest, 
  PayJSNativeResponse,
  PayJSMicropayRequest,
  PayJSMicropayResponse,
  PayJSCashierRequest,
  PayJSCashierErrorResponse
} from './types';

/**
 * PayJS SDK 主类
 * 封装了 PayJS 支付相关的所有接口
 */
class PayJS {
  /**
   * API 接口基础地址
   * @private
   */
  private readonly API_BASE = 'https://payjs.cn/api';

  /**
   * 各支付方式对应的接口地址
   * @private
   */
  private readonly NATIVE_API = `${this.API_BASE}/native`;      // 扫码支付
  private readonly MICROPAY_API = `${this.API_BASE}/micropay`;  // 付款码支付
  private readonly CASHIER_API = `${this.API_BASE}/cashier`;    // 收银台支付

  /**
   * @param mchid - PayJS 商户号
   * @param key - PayJS 通信密钥
   */
  constructor(private mchid: string, private key: string) {}

  /**
   * 生成签名
   * 按照 PayJS 签名规则:
   * 1. 将参数按照字典序排序
   * 2. 拼接成 key=value 格式，用 & 连接
   * 3. 最后加上 &key=通信密钥
   * 4. 进行 MD5 运算，转大写
   * @param params - 需要签名的参数对象
   * @private
   */
  private sign(params: Record<string, any>): string {
    // 过滤空值并排序
    const sortedParams = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== '')
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);

    // 拼接签名字符串
    const signStr = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&') + `&key=${this.key}`;

    // MD5 加密并转大写
    return CryptoJS.MD5(signStr).toString(CryptoJS.enc.Hex).toUpperCase();

  }

  /**
   * 统一请求处理方法
   * @param url - 请求地址
   * @param data - 请求数据
   * @private
   */
  private async request<T>(url: string, data: Record<string, any>): Promise<T> {
    // 添加签名
    const fullRequestData = {
      ...data,
      sign: this.sign(data)
    };

    // 确保所有参数都是字符串类型
    const stringifiedData: Record<string, string> = Object.entries(fullRequestData)
      .reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>);

    // 发起请求
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(stringifiedData).toString()
    });

    return response.json();
  }

  /**
   * 扫码支付
   * 适用于PC网站、移动网站等场景
   * @param params - 扫码支付参数
   */
  async native(params: Omit<PayJSNativeRequest, 'mchid'>) {
    const requestData: PayJSNativeRequest = {
      mchid: this.mchid,
      ...params
    };

    return this.request<PayJSNativeResponse>(this.NATIVE_API, requestData);
  }

  /**
   * 付款码支付
   * 适用于线下实体店扫码枪扫码
   * @param params - 付款码支付参数
   * @throws {Error} 当授权码格式不正确或支付失败时抛出错误
   */
  async micropay(params: Omit<PayJSMicropayRequest, 'mchid'>) {
    // 验证授权码格式（18位数字，以10-15开头）
    if (!/^1[0-5]\d{16}$/.test(params.auth_code)) {
      throw new Error('Invalid auth_code format. Should be 18 digits starting with 10-15');
    }

    const requestData: PayJSMicropayRequest = {
      mchid: this.mchid,
      ...params
    };

    const result = await this.request<PayJSMicropayResponse>(this.MICROPAY_API, requestData);

    // 处理支付失败情况
    if (result.return_code === 0 && result.msg) {
      throw new Error(result.msg);
    }

    return result;
  }

  /**
   * 收银台支付
   * 适用于微信内H5浏览器环境
   * 返回收银台URL，前端需要跳转到该地址进行支付
   * @param params - 收银台支付参数
   * @returns 收银台完整URL
   */
  cashier(params: Omit<PayJSCashierRequest, 'mchid'>): string {
    const requestData: PayJSCashierRequest = {
      mchid: this.mchid,
      ...params
    };

    // 生成签名
    const sign = this.sign(requestData);

  // 将所有参数转换为字符串
  const stringifiedParams: Record<string, string> = {
    ...Object.entries(requestData).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: String(value)
    }), {}),
    sign,
    // 布尔值转换为数字字符串
    ...(params.auto !== undefined && { auto: params.auto ? '1' : '0' }),
    ...(params.hide !== undefined && { hide: params.hide ? '1' : '0' })
  };

  // 构造URL参数
  const urlParams = new URLSearchParams(stringifiedParams);

    // 返回完整的收银台URL
    return `${this.CASHIER_API}?${urlParams.toString()}`;
  }
}

export default PayJS;