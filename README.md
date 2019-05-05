# 内聚的事件管理器

## 克隆 & 使用

懒得编译发布了, 进入项目

```sh
cd your-project/components
```

拷贝并执行以下命令, 将会只克隆组件代码

```sh
clone-by-ymzuiku(){
  git clone --depth=1 https://github.com/ymzuiku/$1.git && rm -rf $1/.git $1/.gitignore
}
clone-by-ymzuiku react-event-manager
```

直接引用

```js
import Manager from 'components/react-event-manager';
```

## API

### Manager API

| key         | 类型               | 说明                                                                          |
| ----------- | ------------------ | ----------------------------------------------------------------------------- |
| datas       | Object             | Manager 的数据集合, 具体内容参考 datas API                                    |
| onEvent     | Function           | 当 Event 的事件触发时, 进行回调                                               |
| onDidMount  | Function           | 当 Manager DidMount 时, 进行回调                                              |
| onUnMount   | Function           | 当 Manager UnMount 时, 进行回调                                               |
| group | String | 默认为 'handle', 如果多个Manger嵌套, 希望父集捕获子集时, 可以修改group, 然后在子集注入多个 handle |

### Handle API

我们可以为一个组件注入以下props, Manger会递归子组件, 根据这些props注入相应的

| key          | 类型          | 说明                                                                                                         |
| ------------ | ------------- | ------------------------------------------------ |
| handle         | String        | handle 请确保同一个 Manager 下 所有 handle 是唯一的, Manager 的数据集合                                      |
| valuekey         | String | 该 Event 会触发的值, 默认为 'value' |
| events         | String | 该 Event 会触发的值和事件, 默认为 'onChange, onKeyEnter' |
| defvalue | any           | 默认设置给 value 的值                                                                                        |
| SubManager | Boolean | SubManager 标记为 true, 会被注入 SubManager 组件, 用于跨组件捕获事件至父 Manager |

### datas API

| key       | 类型                 | 说明                                                           |
| --------- | -------------------- | -------------------------------------------------------------- |
| handle      | String               | 触发事件的 handle 名称                                          |
| value     | Any                  | onEvent 返回的值, 如果是 DOM 对象返回的是 event.target.value   |
| values    | {[handle]:value, ...}  | 由 handle 名和 value 组合而成的对象                                |
| ref       | React.element        | 当前触发的 React 对象                                          |
| refs      | Array<React.element> | 所有被 <Event /> 包裹的 React 对象的集合                       |
| update   |   (handleName, nextProps)=>void     | 更新某个子组件的函数, 参数会作为 Props 传递给子组件 |
| eventHandle | any                  | 触发 onEvent 的类型, 如 onChange, onClick                      |
| eventArgs | Array<any>           | 触发 onEvent 的类型的默认参数                                  |

## 基本使用方式

Manger本身不包含DOM, 所以需要将他放在一个标签内, 如 div 内:

```js
export default ()=> {
  return (
    <div>
      <Manager>
        <input />
        <button />
      </Manager>
    <div>
  )
}
```

接下来的例子, 我们默认 Manager 在一个 div 内

## 捕获事件

Manager 内的组件添加一个 handle 属性, Manager 即可捕获其的事件, 默认捕获 `onChange, onKeyEnter`

```js
// 所有值, ref, update事件, 联动对象, 都在 datas 中
<Manager onEvent={datas => console.log(datas)}>
  <input defvalue="hello" handle="username />
  <div>
    <div>多层级内的 handle 一样可以捕获</div>
    <input handle="password" />
  </div>
</Manager>
```

## 触发其他事件

主动触发非常简单, 主动设置 events 类型如: `onMouseEnter, onMouseLeave`

```js
<Manager onEvent={(event, datas) => console.log(event, datas)}>
  <input defvalue="hello" handle="username />
  <input handle="password" />
  <button events="onMouseEnter, onMouseLeave" handle="theButton" />
</Manager>
```

在原有的事件上扩展事件, 默认事件为 onChange, onKeyEnter, 在此基础上扩展, 可使用 `...` 符号:

```js
<Manager onEvent={(event, datas) => console.log(event, datas)}>
  <input defvalue="hello" handle="username />
  <input handle="password" />
  <button events="..., onMouseLeave" handle="theButton" />
</Manager>
```

## 跨组件捕获

1. 声明一个组件为 SubManager

```js
<Manager onEvent={(event, datas) => console.log(event, datas)}>
  <HeaderBar SubManager></HeaderBar>
</Manager>
```

2. 该组件会被注入一个 SubManager 组件, SubManager 将捕获的事件返回到父 Manager

```js
function HeaderBar({SubManager}){
  return (
    <SubManager>
      <div>
        <input handle="search" />
      </div>
    </SubManager>
  )
}
```


## 联动

```js
// 所有值, ref, update事件, 联动对象, 都在 事件的返回值中
<Manager onEvent={({values, update, name})=> {
  // 如果username包含 404, 就更新 password
  if (values.username.index('404') >= 0) {
    update('password', {
      value: '被联动修改了',
      style:{{ color:'#f00' }},
    })
  }
}}>
  <input defvalue="hello" handle="username />
  <input handle="password" />
</Manager>
```

## 根据条件执行事件

```js
// refs 中包含所有 Event 子组件的ref, 根据条件执行事件即可
<Manager
  onEvent={({ value, refs }) => {
    if (value === '...') {
      refs.button.save();
    }
  }}
>
  <div>我是标题</div>
  <Button handle="button" />
</Manager>
```

## 获取 Manager 数据

我们在 onChange 中可以获取 Manager 数据, 亦可直接传递 datas 获取 Manager 数据

```js
const datas = {};

// ManagerDatas 将会存储在 datas 对象中
<Manager datas={datas}>
  <input defvalue="hello" handle="username />
</Manager>;
```

## 异步设定初始值

```js
<Manager onDidMount={({ update })=> {
  // 异步请求, 根据返回内容更新界面
  fetch(....).then(res=>res.json()).then(data=>{
    update('username', {value: data.username})
  })
}}>
  <input handle="username />
</Manager>
```


## 捕获键盘

捕获 D 键

```js
<Manager onEvent={...}>
  <input events="..., onKeyD" handle="username />
</Manager>
```

捕获组合键: ctrl + shift + d:

```js
<Manager onEvent={...}>
  <input events="..., onKeyD_ctrl_shift" handle="username />
</Manager>
```