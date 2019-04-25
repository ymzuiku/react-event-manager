# 内聚的事件管理器

## 下载 & 使用

懒得编译发布了, 进入项目

```sh
cd your-project/components
```

执行以下命令, 将会只保留组件代码

```sh
git clone --depth=1 https://github.com/ymzuiku/react-event-manager.git && rm -rf react-event-manager/.git react-event-manager/.gitignore
```

直接引用

```js
import Manager from "components/react-event-manager";
```

## API

### Manager API

| key         | 类型               | 说明                                                                          |
| ----------- | ------------------ | ----------------------------------------------------------------------------- |
| datas       | Object             | Manager 的数据集合, 具体内容参考 datas API                                    |
| onEvent     | Function           | 当 Event 的事件触发时, 会进行回调                                             |
| onTrigger   | Function           | 当 Event 的 onTrigger 事件触发时, 会进行回调                                  |
| onDidMount  | Function           | 当 Manager DidMount, 会进行回调                                               |
| onUnMount   | Function           | Manager UnMount, 会进行回调                                                   |
| renderProps | [Event, onTrigger] | Event 是用于处理输入组件的组件, onTrigger 是用于触发 Manager.onTirgger 的函数 |

### Event API

| key          | 类型          | 说明                                                                                                         |
| ------------ | ------------- | ------------------------------------------------------------------------------------------------------------ |
| keys         | Array<String> | 该 Event 会触发的值和事件, 默认为 ['value', 'onChange', 'onClick', 'onTouchEnd'], 其中第一个为值, 其他为对象 |
| name         | String        | 请确保同一个 Manager 下 所有 Event 的 name 是唯一的, Manager 的数据集合                                      |
| defaultValue | Any           | 默认设置给 value 的值                                                                                        |

### datas API

| key       | 类型                 | 说明                                                           |
| --------- | -------------------- | -------------------------------------------------------------- |
| name      | String               | 触发事件的 Event.name                                          |
| value     | Any                  | onEvent 返回的值, 如果是 DOM 对象返回的是 event.target.value   |
| values    | {[name]:value, ...}  | 由 name 和 value 组合而成的对象                                |
| ref       | React.element        | 当前触发的 React 对象                                          |
| refs      | Array<React.element> | 所有被 <Event /> 包裹的 React 对象的集合                       |
| updates   | {[name]:update}      | 每个 Event 更新子组件的函数集合, 参数会作为 Props 传递给子组件 |
| eventName | any                  | 触发 onEvent 的类型, 默认情况下为 onEvent                      |
| eventArgs | Array<any>           | 触发 onEvent 的类型的默认参数                                  |

## 基本使用方式

```js
// 所有值, ref, update事件, 联动对象, 都在 datas 中
<Manager onEvent={datas => console.log(datas)}>
  {Event => (
    <div>
      <div>我是标题</div>
      <Event defaultValue={"hello"} name="username">
        <input />
      </Event>
      <Event name="password">
        <input />
      </Event>
    </div>
  )}
</Manager>
```

## 联动

```js
// 所有值, ref, update事件, 联动对象, 都在 params 中
<Manager onEvent={({values, updates, name})=> {
  // 如果username包含 404, 就更新 password
  if (values.username.index('404') >= 0) {
    updates.password({
      value: '被联动修改了',
      style:{{ color:'#f00' }},
    })
  }
}}>
  {Event=>(
    <div>
      <div>我是标题</div>
      <Event defaultValue={"hello"} name="username">
        <input />
      </Event>
      <Event name="password">
        <input />
      </Event>
    </div>
  )}
</Manager>
```

## 主动触发

主动触发非常简单, 将 renderProps 中 onTrigger 函数设置为触发事件即可

```js
<Manager onTrigget={(event, datas) => console.log(event, datas)}>
  {(Event, onTrigger) => (
    <div>
      <div>我是标题</div>
      <Event defaultValue={"hello"} name="username">
        <input />
      </Event>
      <Event name="password">
        <input />
      </Event>
      <button onClick={onTrigger}>提交</button>
    </div>
  )}
</Manager>
```

## 根据条件执行事件

```js
// refs 中包含所有 Event 子组件的ref, 根据条件执行事件即可
<Manager
  onEvent={({ value, refs }) => {
    if (value === "...") {
      refs.button.save();
    }
  }}
>
  {Event => (
    <div>
      <div>我是标题</div>
      <Event name="button">
        <Button />
      </Event>
    </div>
  )}
</Manager>
```

## 获取 Manager 数据

我们在 onChange 中可以获取 Manager 数据, 亦可直接传递 datas 获取 Manager 数据

```js
const datas = {};

// ManagerDatas 将会存储在 datas 对象中
<Manager datas={datas}>
  {Event => (
    <div>
      <div>我是标题</div>
      <Event defaultValue={"hello"} name="username">
        <input />
      </Event>
      <Event name="password">
        <input />
      </Event>
    </div>
  )}
</Manager>;
```

## 异步设定初始值

```js
// 所有值, ref, update 事件, 联动对象, 都在 params 中
<Manager onDidMount={({updates})=> {
  fetch(....).then(res=>res.json()).then(data=>{
    updates.username({value: data.username})
    updates.vip({title: data.vip})
  })
}}>
  {Event=>(
    <div>
      <div>我是标题</div>
      <Event defaultValue={"hello"} name="username">
        <input />
      </Event>
      <Event name="vip">
        <Title />
      </Event>
    </div>
  )}
</Manager>
```
