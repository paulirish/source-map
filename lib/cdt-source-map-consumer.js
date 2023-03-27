
// Mirror of sourcemapconsumer API but using the CDT impl
class CDTSourceMapConsumer {
  constructor(payload) {
    if (typeof payload === 'string') {
      if (payload.slice(0, 3) === ')]}')
        payload = payload.substring(payload.indexOf('\n'));
      payload = JSON.parse(payload);
    }
    this._map = new SDK.TextSourceMap(`compiled.js`, `compiled.js.map`, payload);
    this._json = payload;
    // console.log(this._map);
    return Promise.resolve(this);
  }
  get sources() {
    return this._map.sourceURLs();
  }
  get sourceRoot() {
    return this._json.sourceRoot;
  }
  originalPositionFor({line, column, bias}) {
    // assert.equal(bias, null);
    const lineNumber0 = line - 1;
    // findEntry takes compiled locations and returns original locations.
    const entry = this._map.findEntry(lineNumber0, column);
    const res = {
      source: entry.sourceURL,
      line: entry.sourceLineNumber + 1,
      column: entry.sourceColumnNumber,
      name: entry.name
    };
    return res;
  }
  generatedPositionFor({source, line, column, bias}) {
    // assert.equal(bias, null);
    const lineNumber0 = line - 1;
    const entry = this._map.sourceLineMapping(source, lineNumber0, column);
    const res = { // generated source
      line: entry.lineNumber + 1,
      column: entry.columnNumber,
    };
    return res;
  }

  /**
   * @param {*} callback The function that is called with each mapping. Mappings have the form { source, generatedLine, generatedColumn, originalLine, originalColumn, name }
   * @param {*} context Optional. If specified, this object will be the value of this every time that callback is called.
   * @param {*} order Either SourceMapConsumer.GENERATED_ORDER or SourceMapConsumer.ORIGINAL_ORDER. Specifies whether you want to iterate over the mappings sorted by the generated file's line/column order or the original's source/line/column order, respectively. Defaults to SourceMapConsumer.GENERATED_ORDER.
   */
  eachMapping(callback, context, order) {
    this._map.mappings().forEach(mapping => {
      // TODO: change NaN's to nulls
      const ret = {
        generatedLine: mapping.lineNumber === undefined ? null : mapping.lineNumber + 1,
        generatedColumn: mapping.columnNumber,
        source: mapping.sourceURL === undefined ? null : mapping.sourceURL,
        originalLine: mapping.sourceLineNumber === undefined ? null : mapping.sourceLineNumber + 1,
        originalColumn: mapping.sourceColumnNumber === undefined ? null : mapping.sourceColumnNumber,
        name: mapping.name === undefined ? null : mapping.name,
      };
      callback.call(context, ret);
    });
  }

  allGeneratedPositionsFor({source, line, column}) {
    return this._map.findReverseEntries(source, line - 1, column).map(entry => ({
      line: entry.lineNumber + 1,
      column: entry.columnNumber
    }));
  }

  destroy () {}
};


exports.CDTSourceMapConsumer = CDTSourceMapConsumer;
