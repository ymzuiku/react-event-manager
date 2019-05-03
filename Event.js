import React from 'react';

export default class Event extends React.PureComponent {
  static defaultProps = {
    // 用于配置其他触发onChange的键
    events: 'onChange, onKeyEnter',
    onKeyEvent: 'onKeyUpCapture',
    valuekey: 'value',
  };

  lastValue = this.props.defvalue || '';

  unMount = false;

  constructor(props) {
    super(props);

    const { children } = props;

    // 判断 children 是否属于纯函数组件, 只有纯函数才捆绑 ref
    if (children.type && ((children.type.prototype && children.type.prototype.render) || children.type.render)) {
      this.ref = (children.props && children.props.innerRef) || React.createRef();
    }

    this.state = {
      value: this.props.defvalue || '',
      // 用于update时, 更新其他props
      otherProps: {},
    };

    // 如果使用默认的属性进行拼接, 需要包含 ...

    const eventsString =
      this.props.events.indexOf('...') >= 0
        ? this.props.events.replace('...', Event.defaultProps.events)
        : this.props.events;

    const events = eventsString
      .split(',')
      .map(v => v.trim())
      .filter(Boolean);

    this.onEvents = {};
    const keyEvents = [];

    events.forEach(k => {
      if (/onKey/.test(k)) {
        keyEvents.push((value, ...args) => {
          if (value && value.key) {
            const keys = k.replace('onKey', '').split('_');

            let isModfileKeyDown = true;

            keys.forEach((keyType, i) => {
              if (i > 0) {
                const modKey = keyType.toLowerCase() + 'Key';

                if (value[modKey] !== true) {
                  isModfileKeyDown = false;
                }
              }
            });

            if (isModfileKeyDown && keys[0].toUpperCase() === value.key.toUpperCase()) {
              this.handleOnEvent(this.lastValue, [this.lastValue, ...args], k);
            }
          }
        });
      } else {
        this.onEvents[k] = (value, ...args) => {
          this.handleOnEvent(value, [value, ...args], k);
        };
      }
    });

    if (keyEvents.length > 0) {
      this.onEvents[this.props.onKeyEvent] = (value, ...args) => {
        keyEvents.forEach(fn => {
          fn(value, ...args);
        });
      };
    }
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

  handleOnEvent = (e, eventArgs, eventName) => {
    const { onEvent, handle, children, formRefs, formValues } = this.props;

    let v = e;
    let isAsync = true;

    const updateValue = (value, isFile) => {
      // 更新value
      if (!isFile && value !== this.state.value) {
        this.setState({ value });
      }
      this.lastValue = value;

      if (typeof onEvent === 'function') {
        // 统一回调到Form的onChange中
        onEvent({
          ref: this.ref,
          value,
          handle,
          eventArgs,
          update: this.update,
          eventName,
        });

        let propsEventName;

        // 如果是 onKey事件, 则响应 onKey 相关的 props 函数, 如 onKeyUpCapture
        if (/onKey/.test(eventName)) {
          propsEventName = this.props.onKeyEvent;
        } else {
          propsEventName = eventName;
        }

        // 如果子注册了相应的事件函数, 也同事响应它, 并且传递其他状态数据
        if (children.props && typeof children.props[propsEventName] === 'function') {
          children.props[eventName](e, {
            ref: this.ref,
            value,
            eventArgs,
            handle,
            update: this.update,
            refs: formRefs,
            values: formValues,
            eventName,
          });
        }
      }
    };

    // 如果是DOM对象, 根据类型取值
    if (typeof e === 'object') {
      if (typeof e.preventDefault === 'function') {
        e.preventDefault();
      }
      if (e.target) {
        // 如果是文件类型, 读取文件数据
        if (e.target.files) {
          isAsync = false;
          v = e.target.files[0];
          const reader = new FileReader();

          reader.readAsBinaryString(v);
          reader.onloadend = fileData => {
            updateValue({ result: fileData.target.result, progress: fileData }, true);
          };
        } else {
          v = e.target.value;
        }
      }
    }

    if (isAsync) {
      updateValue(v);
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
    const { value, otherProps } = this.state;
    const { children, valuekey } = this.props;

    const nextProps = {
      ...otherProps,
      ...this.onEvents,
      [valuekey]: value,
      ref: this.ref,
    };

    // 根据 children 类型执行不同的渲染方式, 只支持 fn children 和单 children
    if (typeof children === 'function') {
      return children(nextProps);
    }

    return React.cloneElement(children, nextProps);
  }
}
