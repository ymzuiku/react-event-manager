import React, { Component } from 'react';

interface IDatas {
  /** 触发事件的 handle 名  */
  handle: String;
  /** onEvent 返回的值, 如果是 DOM 对象返回的是 event.target.value */
  value: any;
  /** 由 name 和 value 组合而成的对象 */
  values: Object;
  /** 当前触发的 React 对象 */
  ref: React.ReactElement;
  /** 所有被 <Event /> 包裹的 React 对象的集合 */
  refs: Array<React.ReactElement>;
  /** 每个 Event 更新子组件的函数集合, 参数会作为 Props 传递给子组件 */
  updates: Object;
  /** 触发 onEvent 的类型, 如 onChange, onClick */
  eventName: String;
  /** 触发 onEvent 的类型的默认参数 */
  eventArgs: Array<any>;
}

interface IProps {
  /** Manager 的数据集合, 具体内容参考 datas API */
  datas: Object;
  /** 当 Event 的事件触发时, 会进行回调 */
  onEvent: (datas: IDatas) => void;
  /** 当 Manager DidMount, 会进行回调 */
  onDidMount: (datas: IDatas) => void;
  /** 当 Manager UnMount, 会进行回调 */
  onUnMount: (datas: IDatas) => void;
  /** Event 是用于处理输入组件的组件, onTrigger 是用于触发 Manager.onTirgger 的函数 */
  children: React.ReactElement;
}

export default class extends Component<IProps> {}
