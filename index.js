// 基于 React 事件的, 内聚的事件管理器
import React from 'react';

// eslint-disable-next-line
class Event extends React.PureComponent {
  static defaultProps = {
    // 用于配置其他触发onChange的键
    events: 'onChange, onClick, onTouchEnd',
    valuekey: 'value',
  };

  constructor(props) {
    super(props);

    this.state = {
      value: this.props.defvalue || '',
      // 用于update时, 更新其他props
      otherProps: {},
    };

    this.unMount = false;
    this.ref = (this.props.children.props && this.props.children.props.innerRef) || React.createRef();
    const events = this.props.events.split(',').map(v => v.trim());

    this.onEvents = {};

    events.forEach(k => {
      this.onEvents[k] = (value, ...args) => {
        this.handleOnEvent(value, [value, ...args], k);
      };
    });
  }

  componentDidMount() {
    const { onDidMount, handle } = this.props;

    if (typeof onDidMount === 'function') {
      // 用于在渲染后,就获得refs对象结构
      onDidMount({
        ref: this.ref,
        value: this.state.value,
        handle,
        update: this.update,
      });
    }
  }

  componentWillUnmount() {
    this.unMount = true;
  }

  handleOnEvent = (e, eventArgs, eventHandle) => {
    const { onEvent, handle, children, formRefs, formValues } = this.props;

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
        handle,
        eventArgs,
        update: this.update,
        eventHandle,
      });

      // 如果子注册了相应的事件函数, 也同事响应它, 并且传递其他状态数据
      if (children.props && typeof children.props[eventHandle] === 'function') {
        children.props[eventHandle](e, {
          ref: this.ref,
          value,
          eventArgs,
          handle,
          update: this.update,
          refs: formRefs,
          values: formValues,
          eventHandle,
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
        otherProps,
      };
    });
  };

  render() {
    const { value, valuekey, otherProps } = this.state;
    const { children } = this.props;

    // 根据 children 类型执行不同的渲染方式, 只支持 fn children 和单 children
    if (typeof children === 'function') {
      return children({
        ...otherProps,
        ...this.onEvents,
        [valuekey]: value,
        ref: this.ref,
      });
    }

    return React.cloneElement(children, {
      ...children.props,
      ...otherProps,
      ...this.onEvents,
      [valuekey]: value,
      ref: this.ref,
    });
  }
}

// eslint-disable-next-line
export default class extends React.PureComponent {
  static defaultProps = {
    group: 'handle',
  };

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

  handleOnDidMound = params => {
    this.handleOnEvent({ ...params, isFromDidMount: true });
  };

  handleOnEvent = ({ ref, value, handle, update, eventHandle, eventArgs, isFromDidMount }) => {
    const { datas, onEvent } = this.props;

    this.formValues[handle] = value;
    this.formRefs[handle] = ref;
    this.formUpdates[handle] = update;
    this.formDatas = {
      ref,
      value,
      handle,
      values: this.formValues,
      eventArgs,
      refs: this.formRefs,
      updates: this.formUpdates,
      eventHandle,
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

  regChild = ({ children }) => {
    const { group } = this.props;

    return React.Children.map(children, child => {
      if (!child || !child.props) {
        return child;
      }

      if (child.props.children && typeof child.props.children !== 'function') {
        child = React.cloneElement(child, {
          children: this.regChild({ children: child.props.children }),
        });
      }

      if (child.props.SubManager) {
        child = React.cloneElement(child, { SubManager: this.regChild });
      }

      if (child.props[group]) {
        return (
          <Event
            defvalue={child.props.defvalue}
            events={child.props.events}
            handle={child.props[group]}
            onDidMount={this.handleOnDidMound}
            onEvent={this.handleOnEvent}
            formValues={this.formValues}
            formTargets={this.formRefs}
          >
            {child}
          </Event>
        );
      }
      return child;
    });
  };

  render() {
    const { children } = this.props;

    return this.regChild({ children });
  }
}
