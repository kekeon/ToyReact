import { createElement, Component, render } from './toy-react.js';

class MyComponent extends Component {

    render() {
        return (
            <div>
                <h1>
                    MyComponent
                </h1>
                {this.children}
            </div>
        )
    }
}

render(<MyComponent id='my' class='cl'>
    <div>
        1
    </div>
    <div>
        2
    </div>
</MyComponent >, document.body)

/* function createElement(type, attr, ...children) {
    console.log(type, attr, ...children)
}

let a = <div>
    <p>1</p>
    <p>aaa</p>
</div>

console.log(a) */