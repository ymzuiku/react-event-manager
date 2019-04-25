import React, { Component } from 'react';

interface IDatas {
  /** 触发事件的 Event.name  */
  name: String;
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
  /** 触发 onEvent 的类型, 默认情况下为 onEvent */
  eventName: String;
  /** 触发 onEvent 的类型的默认参数 */
  eventArgs: Array<any>;
}

interface IEventProps {
  /** 默认设置给 value 的值 */
  defaultValue: String;
  /** 该 Event 会触发的值和事件, 默认为 ['value', 'onChange', 'onClick', 'onTouchEnd'], 其中第一个为值, 其他为对象 */
  keys: Array<String>;
  /** 请确保同一个 Manager 下 所有 Event 的 name 是唯一的, Manager 的数据集合 */
  name: String;
}

interface IProps {
  /** Manager 的数据集合, 具体内容参考 datas API */
  datas: Object;
  /** 当 Event 的事件触发时, 会进行回调 */
  onEvent: (datas: IDatas) => void;
  /** 当 Event 的 onTrigger 事件触发时, 会进行回调 */
  onTrigger: (datas: IDatas) => void;
  /** Event 是用于处理输入组件的组件, onTrigger 是用于触发 Manager.onTirgger 的函数 */
  children: (Event: IEventProps, onTrigger: Function) => React.ReactElement;
}

export default class extends Component<IProps> {}
