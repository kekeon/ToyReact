const RENDER_TO_DOM = Symbol('render to dom');

export class Component {
    constructor() {
        this.props = Object.create(null)
        this.children = [];
        this._root = null;
        this._range = null;
    }

    setAttribute(name, value) {
        this.props[name] = value
    }

    appendChild(component) {
        this.children.push(component)
    }

    [RENDER_TO_DOM](range) {
        this._range = range;
        this._vdom = this.vdom;
        this._vdom[RENDER_TO_DOM](range);
    }

    // 比对部分渲染diff V1.0.1
    update() {

        let isSameNode = (oldNode, newNode) => {

            // 类型不同
            if (oldNode.type !== newNode.type) {
                return false
            }

            // 参数不同
            for (let name in newNode.props) {
                if (newNode.props[name] !== oldNode.props[name]) {
                    return false
                }
            }

            // 参数数量不同
            if (Object.keys(oldNode.props).length > Object.keys(newNode.props).length) {
                return false
            }

            // 文本节点内容不同
            if (newNode.type === "#text") {
                if (newNode.content !== oldNode.content) {
                    return false
                }
            }

            return true
        }

        let update = (oldNode, newNode) => {
            // 对比的 type, props, children
            // #text content
            if (!isSameNode(oldNode, newNode)) {
                newNode[RENDER_TO_DOM](oldNode._range)
                return;
            }

            newNode._range = oldNode._range
            // children 处理
            let newChildren = newNode.vchildren;
            let oldChildren = oldNode.vchildren;

            if (!newChildren || !newChildren.length) {
                return;
            }

            let tailRange = oldChildren[oldChildren.length - 1]._range;

            for (let i = 0; i < newChildren.length; i++) {

                let newChild = newChildren[i];
                let oldChild = oldChildren[i];

                if (i < oldChildren.length) {
                    update(oldChild, newChild)
                } else {
                    let range = document.createRange();
                    range.setStart(tailRange.endContainer, tailRange.endOffset)
                    range.setEnd(tailRange.endContainer, tailRange.endOffset)
                    newChild[RENDER_TO_DOM](range)
                    tailRange = range;
                    // TODO
                }

            }
        }

        let vdom = this.vdom;
        update(this._vdom, vdom)
        this._vdom = vdom
    }

    /* V1.0.0    rerender() { 全部重新渲染
            let oldRange = this._range;
    
            // 创建新得range 
            let range = document.createRange();
            range.setStart(oldRange.startContainer, oldRange.startOffset);
            range.setEnd(oldRange.startContainer, oldRange.startOffset);
            this[RENDER_TO_DOM](range)
    
            // 处理旧的 range
            oldRange.setStart(range.endContainer, range.endOffset);
            oldRange.deleteContents();
        } */

    setState(newState) {
        if (this.state === null || typeof this.state !== "object") {
            this.state = newState
            //this.rerender();
            this.update()
            return;
        }

        let merge = (oldState, newState) => {
            for (let k in newState) {
                if (oldState[k] === null || typeof oldState[k] !== "object") {
                    oldState[k] = newState[k];
                } else {
                    merge(oldState[k], newState[k]);
                }
            }
        }

        merge(this.state, newState)
        this.update();
    }

    get vdom() {
        return this.render().vdom;
    }

    /*     get vchildren() {
            return this.children.map(child => child.vdom)
        } */

    /* V1.0
    get root() {
        if (!this._root) {
            this._root = this.render().root;
        }
        return this._root;
    } */
}


class ElementWrapper extends Component {
    constructor(type) {
        super(type)
        this.type = type;
        // this.root = document.createElement(type);
    }

    /*     setAttribute(name, value) { v1.0.0
            // 匹配注册事件
            if (name.match(/^on([\s\S]+)$/)) {
                this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value)
            } if (name === 'className') {
                this.root.setAttribute("class", value)
            } else {
                this.root.setAttribute(name, value)
            }
        }
    
        appendChild(component) { v1.0.0
            //v1.0 this.root.appendChild(component.root)
            let range = document.createRange();
            range.setStart(this.root, this.root.childNodes.length)
            range.setEnd(this.root, this.root.childNodes.length)
            component[RENDER_TO_DOM](range)
        } */

    get vdom() {
        this.vchildren = this.children.map(child => child.vdom)
        return this;
        /* return {
            type: this.type,
            props: this.props,
            children: this.children.map(child => child.vdom)
        } */
    }

    // 虚拟dom 到 实体 dom
    [RENDER_TO_DOM](range) {
        this._range = range;
        //  range.deleteContents();
        // range.insertNode(this.root);

        let root = document.createElement(this.type)
        // range.insertNode(root)
        for (let name in this.props) {
            let value = this.props[name]
            if (name.match(/^on([\s\S]+)$/)) {
                root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value)
            } if (name === 'className') {
                root.setAttribute("class", value)
            } else {
                root.setAttribute(name, value)
            }
        }

        if (!this.vchildren) {
            this.vchildren = this.children.map(child => child.vdom)
        }


        for (let child of this.vchildren) {
            let childRange = document.createRange();
            childRange.setStart(root, root.childNodes.length)
            childRange.setEnd(root, root.childNodes.length)
            child[RENDER_TO_DOM](childRange)
        }

        relplaceContent(range, root)
        // range.insertNode(root);
    }
}

class TextWrapper extends Component {
    constructor(content) {
        super(content)
        this.type = "#text"
        this.content = content;
        // this.root = document.createTextNode(content)
    }

    [RENDER_TO_DOM](range) {
        this._range = range;
        // range.deleteContents();
        // range.insertNode(this.root);
        let root = document.createTextNode(this.content)
        relplaceContent(range, root)
    }

    get vdom() {
        return this;
        /* return {
            type: "#text",
            content: this.content
        } */
    }
}

function relplaceContent(range, node) {
    range.insertNode(node)
    range.setStartAfter(node)
    range.deleteContents();

    range.setStartBefore(node)
    range.setEndAfter(node)
}


export function createElement(type, attributes, ...children) {

    let e;

    if (typeof type === 'string') {
        e = new ElementWrapper(type)
    } else {
        e = new type();
    }

    for (let a in attributes) {
        e.setAttribute(a, attributes[a])
    }


    let insertChildren = (childs) => {
        for (let child of childs) {
            if (typeof child === 'string') {
                child = new TextWrapper(child)
                // e.appendChild(child)
            }

            if (child === null) {
                continue;
            }

            if (Array.isArray(child)) {
                insertChildren(child)
            } else {
                e.appendChild(child)
            }
        }
    }

    insertChildren(children)


    return e
}

export function render(component, parentElement) {
    // v1.0 parentElement.appendChild(component.root)
    let range = document.createRange();
    range.setStart(parentElement, 0)
    range.setEnd(parentElement, parentElement.childNodes.length)
    range.deleteContents();
    component[RENDER_TO_DOM](range)
}