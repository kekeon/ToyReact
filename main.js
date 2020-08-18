import { createElement, Component, render } from './toy-react.js';

class MyComponent extends Component {

    constructor() {
        super();
        this.state = {
            a: 1,
            b: 2
        }
    }

    render() {
        return (
            <div>
                <h1>
                    MyComponent
                </h1>
                <button onClick={() => {
                    this.setState({
                        a: this.state.a + 1
                    })
                }}>add</button>
                <p>{this.state.a.toString()}</p>
                <p>{this.state.b.toString()}</p>
                {this.children}
            </div>
        )
    }
}

render(<MyComponent id='my' class='cl'>
    <div>
        root 666
    </div>
    <div>
        root 888
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