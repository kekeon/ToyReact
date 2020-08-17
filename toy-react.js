class ElementWrapper {
    constructor(type) {
        this.root = document.createElement(type);
    }

    setAttribute(name, value) {
        this.root.setAttribute(name, value)
    }

    appendChild(component) {
        this.root.appendChild(component.root)
    }
}

class TextWrapper {
    constructor(content) {
        this.root = document.createTextNode(content)
    }
}

export class Component {
    constructor() {
        this.props = Object.create(null)
        this.children = [];
        this._root = null;
    }

    setAttribute(name, value) {
        this.props[name] = value
    }

    appendChild(component) {
        this.children.push(component)
    }

    get root() {
        if (!this._root) {
            this._root = this.render().root;
        }
        return this._root;
    }
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
                e.appendChild(child)
            }else if (Array.isArray(child)) {
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
    parentElement.appendChild(component.root)
}