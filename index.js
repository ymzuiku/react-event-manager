// 基于 React 事件的, 内聚的事件管理器
import React from 'react';
import Event from './Event';

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

  update = (key, payload) => {
    if (this.formUpdates[key]) {
      this.formUpdates[key](payload);
    }
  };

  handleOnEvent = ({ ref, value, handle, update, eventName, eventArgs, isFromDidMount }) => {
    const { datas, onEvent } = this.props;

    this.formValues[handle] = value;
    this.formRefs[handle] = ref;
    this.formUpdates[handle] = update;
    this.formDatas = {
      ref,
      value,
      handle,
      eventArgs,
      refs: this.formRefs,
      values: this.formValues,
      update: this.update,
      eventName,
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
