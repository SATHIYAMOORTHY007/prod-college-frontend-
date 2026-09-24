import { Provider } from 'react-redux'

function ReduxProvider({ store, children }) {
  return <Provider store={store}>{children}</Provider>
}

export default ReduxProvider
