var ns = require('./ns');

/**
 * Компонент, который дает доступ к моделям
 * для определенной части VirtualDOM.
 * Аналог connect в Redux.
 *
 * @example
 *
 *   ```js
 *   <DataProvider model="photos" params={...}>
 *       {(status, data) => {
 *           switch (status) {
 *               case ns.V.OK:
 *                   return <MySuperView prop1={data.foo} prop2={data.bar} />;
 *               case ns.V.LOADING:
 *                   return <Spin />;
 *               case ns.V.ERROR:
 *                   return <Error />;
 *           }
 *       }}
 *   </DataProvider>
 *   ```
 */
var DataProvider = function(props) {
    var layout = props.children;
    var model = ns.Model.get(props.model, props.params);

    if (model.isValid()) {
        return layout(
            ns.V.OK, model.getData()
        );
    } else if (model.getError()) {
        return layout(
            ns.V.ERROR, model.getError()
        );
    }
    ns._requestsInUpdate.push({
        id: props.model,
        params: props.params
    });
    return layout(ns.V.LOADING, null);
};

module.exports = DataProvider;
