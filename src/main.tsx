import './styles/index.less';

import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import App from './App';
import { ELEMENT_ID_ROOT } from './consts/common';
import store from './stores';

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById(ELEMENT_ID_ROOT),
);
