### Toy React

simple react

#### P1

1. webpack 配置

2. 使用 plugin-transform-react-jsx 对 jsx 语法的转换

```js
// 相关参数， 在实现过程中，自定义了，createElement 的实现
[
  "@babel/plugin-transform-react-jsx",
  {
    pragma: "Preact.h", // default pragma is React.createElement
    pragmaFrag: "Preact.Fragment", // default is React.Fragment
    throwIfNamespace: false, // defaults to true
  },
];
```

3. ElementWrapper、TextWrapper、Component、createElement 相关实现

4. update 简单 diff 实现局部更新

5. 待回顾
