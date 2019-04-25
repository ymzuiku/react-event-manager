// 基于 React 事件的, 内聚的事件管理器
import React from 'react';

// eslint-disable-next-line
class Event extends React.PureComponent {
  static defaultProps = {
    // 用于配置其他触发onChange的键
    keys: ['value', 'onChange', 'onClick', 'onTouchEnd']
  };

  constructor(props) {
    super(props);

    this.state = {
      value: this.props.defaultValue || '',
      // 用于update时, 更新其他props
      otherProps: {}
    };

    this.unMount = false;
    this.ref =
      (this.props.children.props && this.props.children.props.innerRef) ||
      React.createRef();
    this.onEvents = {};
    this.props.keys.forEach((k, i) => {
      if (i !== 0) {
        this.onEvents[k] = (value, ...args) => {
          this.handleOnEvent(value, [value, ...args], k);
        };
      }
    });
  }

  componentDidMount() {
    const { onDidMount, name } = this.props;

    if (typeof onDidMount === 'function') {
      // 用于在渲染后,就获得refs对象结构
      onDidMount({
        ref: this.ref,
        value: this.state.value,
        name,
        update: this.update
      });
    }
  }

  componentWillUnmount() {
    this.unMount = true;
  }

  handleOnEvent = (e, eventArgs, eventName) => {
    const { onEvent, name, children, formRefs, formValues } = this.props;

    let value = e;

    // 如果是DOM对象, 根据类型取值
    if (typeof e === 'object') {
      if (e.target) {
        if (e.target.files) {
          value = e.target.file[0];
        } else {
          value = e.target.value;
        }
      }
    }

    // 更新value
    if (value !== this.state.value) {
      this.setState({ value });
    }

    if (typeof onEvent === 'function') {
      // 统一回调到Form的onChange中
      onEvent({
        ref: this.ref,
        value,
        name,
        eventArgs,
        update: this.update,
        eventName
      });

      // 如果子注册了相应的事件函数, 也同事响应它, 并且传递其他状态数据
      if (children.props && typeof children.props[eventName] === 'function') {
        children.props[eventName](e, {
          ref: this.ref,
          value,
          eventArgs,
          name,
          update: this.update,
          refs: formRefs,
          values: formValues,
          eventName
        });
      }
    }
  };

  update = ({ value, ...otherProps }) => {
    if (this.unMount) {
      return;
    }
    this.setState(({ value: lastValue }) => {
      return {
        value: value || lastValue,
        otherProps
      };
    });
  };

  render() {
    const { value, otherProps } = this.state;
    const { children, keys } = this.props;

    // 根据 children 类型执行不同的渲染方式, 只支持 fn children 和单 children
    if (typeof children === 'function') {
      return children({
        ...otherProps,
        ...this.onEvents,
        [keys[0]]: value,
        ref: this.ref
      });
    }

    return React.cloneElement(children, {
      ...children.props,
      ...otherProps,
      ...this.onEvents,
      [keys[0]]: value,
      ref: this.ref
    });
  }
}

// eslint-disable-next-line
export default class extends React.PureComponent {
  formValues = {};

  formRefs = {};

  formUpdates = {};

  formDatas = {};

  componentDidMount() {
    const { onDidMount } = this.props;

    if (typeof onDidMount === 'function') {
      onDidMount(this.formDatas);
    }
  }

  componentWillUnmount() {
    this.formValues = {};
    this.formRefs = {};
    this.formUpdates = {};
    this.formDatas = {};

    const { onUnMount } = this.props;

    if (typeof onUnMount === 'function') {
      onUnMount(this.formDatas);
    }
  }

  handleOnTrigger = value => {
    const { onTrigger } = this.props;

    if (typeof onTrigger === 'function') {
      onTrigger(value, this.formDatas);
    }
  };

  handleOnDidMound = params => {
    this.handleOnEvent({ ...params, isFromDidMount: true });
  };

  handleOnEvent = ({
    ref,
    value,
    name,
    update,
    eventName,
    eventArgs,
    isFromDidMount
  }) => {
    const { datas, onEvent } = this.props;

    this.formValues[name] = value;
    this.formRefs[name] = ref;
    this.formUpdates[name] = update;
    this.formDatas = {
      ref,
      value,
      name,
      values: this.formValues,
      eventArgs,
      refs: this.formRefs,
      updates: this.formUpdates,
      eventName
    };

    if (datas) {
      for (const k in this.formDatas) {
        datas[k] = this.formDatas[k];
      }
    }

    if (!isFromDidMount && typeof onEvent === 'function') {
      onEvent(this.formDatas);
    }
  };

  event = props => {
    return (
      <Event
        {...props}
        onDidMount={this.handleOnDidMound}
        onEvent={this.handleOnEvent}
        formValues={this.formValues}
        formTargets={this.formRefs}
      />
    );
  };

  render() {
    const { children } = this.props;

    return children(this.event, this.handleOnTrigger);
  }
}
