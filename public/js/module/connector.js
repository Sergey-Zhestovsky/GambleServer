"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function _createClass(e,t,r){return t&&_defineProperties(e.prototype,t),r&&_defineProperties(e,r),e}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var Connector=function(){function n(e){var t=e.signRequests,r=void 0!==t&&t;_classCallCheck(this,n),this.signRequests=r}return _createClass(n,[{key:"request",value:function(e,t){var r=this.customRequest(e,t);return this.defaultEntry(r.request,e,t),r}},{key:"straightRequest",value:function(e,t){return this.defaultEntry(this.customRequest(e,t).request,e,t)}},{key:"defaultEntry",value:function(e,n,o){var s=this;return e.then(function(e){return Promise.resolve(e)},function(e){var t=e.error,r=e.result;return Promise.resolve(s.ErrorHandler(n,o,t,r))}).catch(function(e){console.error(e)})}},{key:"customRequest",value:function(e,t){this.signRequests&&localStorage.getItem("dynamicToken")&&(t.dynamicToken=localStorage.getItem("dynamicToken"));var r=axios.CancelToken.source(),n=axios.post(e,t,{cancelToken:r.token}).then(function(){var e=(0<arguments.length&&void 0!==arguments[0]?arguments[0]:{}).data;if(e.error)throw e;return e.result},function(e){if(axios.isCancel(e))throw{error:"Request canceled"};console.error(e)});return{cancel:r.cancel,request:n}}},{key:"ErrorHandler",value:function(e,t,r,n){if(!r.code)return Promise.reject(r);switch(r.code){case 107:return this.DynamicCookieHandler(e,t,r,n);default:return Promise.reject(r)}}},{key:"DynamicCookieHandler",value:function(e,t,r,n){return!!n.dynamicToken&&(localStorage.setItem("dynamicToken",n.dynamicToken),this.customRequest(e,t).request)}}]),n}();exports.default=Connector;
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImpzL21vZHVsZS9jb25uZWN0b3IuanMiXSwibmFtZXMiOlsiQ29ubmVjdG9yIiwiX3JlZiIsIl9yZWYkc2lnblJlcXVlc3RzIiwic2lnblJlcXVlc3RzIiwiX2NsYXNzQ2FsbENoZWNrIiwidGhpcyIsInBhdGgiLCJvYmplY3QiLCJyZXF1ZXN0T2JqY2V0IiwiY3VzdG9tUmVxdWVzdCIsImRlZmF1bHRFbnRyeSIsInJlcXVlc3QiLCJwcm9taXNlIiwiX3RoaXMiLCJ0aGVuIiwicmVzdWx0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJfcmVmMiIsImVycm9yIiwiRXJyb3JIYW5kbGVyIiwiY2F0Y2giLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwiZHluYW1pY1Rva2VuIiwic291cmNlIiwiYXhpb3MiLCJDYW5jZWxUb2tlbiIsInBvc3QiLCJjYW5jZWxUb2tlbiIsInRva2VuIiwiZGF0YSIsImFyZ3VtZW50cyIsImxlbmd0aCIsInVuZGVmaW5lZCIsImlzQ2FuY2VsIiwiY2FuY2VsIiwiY29kZSIsIkR5bmFtaWNDb29raWVIYW5kbGVyIiwicmVqZWN0Iiwic2V0SXRlbSJdLCJtYXBwaW5ncyI6IkFBQUEscWVBSXFCQSxxQkFDakIsU0FBQUEsRUFBQUMsR0FBc0MsSUFBQUMsRUFBQUQsRUFBeEJFLGFBQUFBLE9BQXdCLElBQUFELEdBQUFBLEVBQUFFLGdCQUFBQyxLQUFBTCxHQUNsQ0ssS0FBS0YsYUFBZUEsdURBR2hCRyxFQUFNQyxHQUNWLElBQUlDLEVBQWdCSCxLQUFLSSxjQUFjSCxFQUFNQyxHQUk3QyxPQUZBRixLQUFLSyxhQUFhRixFQUFjRyxRQUFTTCxFQUFNQyxHQUV4Q0MsMENBVDJCRixFQUFBQyxHQUF4QkosT0FBQUEsS0FBd0JPLGFBQUFMLEtBQUFJLGNBQUFILEVBQVRDLEdBQVNJLFFBQUFMLEVBQUFDLHdDQWdCekJLLEVBQVNOLEVBQU1DLEdBQVEsSUFBQU0sRUFBQVIsS0FmaEMsT0FBS0YsRUFDUlcsS0FBQSxTQUFBQyxHQWlCVyxPQUFPQyxRQUFRQyxRQUFRRixJQUN4QixTQUFBRyxHQUF1QixJQUFwQkMsRUFBb0JELEVBQXBCQyxNQUFPSixFQUFhRyxFQUFiSCxPQUNULE9BQU9DLFFBQVFDLFFBQVFKLEVBQUtPLGFBQWFkLEVBQU1DLEVBQVFZLEVBQU9KLE1BQy9ETSxNQUFNLFNBQUNGLEdBakJWWCxRQUFhVyxNQUFHQSwyQ0FzQlZiLEVBQU1DLEdBQ1pGLEtBQUtGLGNBQWdCbUIsYUFBYUMsUUFBUSxrQkFDMUNoQixFQUFPaUIsYUFBZUYsYUFqQlJmLFFBQVEsaUJBRTdCLElBQUFrQixFQUFBQyxNQUFBQyxZQUFBRixTQWtCT2QsRUFBVWUsTUFBTUUsS0FBS3RCLEVBQU1DLEVBQVEsQ0FDL0JzQixZQUFhSixFQUFPSyxRQWpCSWhCLEtBQUEsV0FBQSxJQUFBaUIsR0FBQSxFQUFBQyxVQUFBQyxhQUFBQyxJQUFBRixVQUFBLEdBQUFBLFVBQUEsR0FBQSxJQUFBRCxLQW9CeEIsR0FBSUEsRUFBS1osTUFuQkgsTUFDSlksRUFFSCxPQUFBQSxFQUF1QmhCLFFBQXBCSSxTQUFBQSxHQUFPSixHQUFhVyxNQUFBUyxTQUFBaEIsR0FDZkgsS0FBUUMsQ0FBQUEsTUFBUSxvQkFFZkUsUUFBUkEsTUFBQUEsS0F5QlIsTUFBTyxDQUNIaUIsT0FBUVgsRUFBT1csT0FyQmZ6QixRQUFBQSx3Q0FPTUwsRUFBQUMsRUFBbUJZLEVBQUFKLEdBQUEsSUFBQUksRUFBQWtCLEtBQWhCTixPQUFnQmYsUUFBaEJlLE9BQWdCWixHQUNyQixPQUFRQSxFQUFSa0IsTUFHQSxLQUFPTixJQUNSLE9BQUNaLEtBQVVtQixxQkFBQWhDLEVBQUFDLEVBQUFZLEVBQUFKLEdBRU4sUUFBT0ksT0FBT0gsUUFBQXVCLE9BQUFwQixpREFYMUJiLEVBQUFDLEVBQUFZLEVBQUFKLEdBaUJBLFFBQU9BLEVBQUFTLGVBQVBGLGFBQUFrQixRQUFBLGVBQUF6QixFQUFBUyxjQUlIbkIsS0FBQUksY0FBQUgsRUFBQUMsR0FBQUkiLCJmaWxlIjoianMvbW9kdWxlL2Nvbm5lY3Rvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuXHJcbi8vaW1wb3J0IEVycm9ySGFuZGxlciBmcm9tICcvanMvbW9kdWxlL2Vycm9ySGFuZGxlci5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25uZWN0b3Ige1xyXG4gICAgY29uc3RydWN0b3IoeyBzaWduUmVxdWVzdHMgPSBmYWxzZSB9KSB7XHJcbiAgICAgICAgdGhpcy5zaWduUmVxdWVzdHMgPSBzaWduUmVxdWVzdHM7XHJcbiAgICB9XHJcblxyXG4gICAgcmVxdWVzdChwYXRoLCBvYmplY3QpIHtcclxuICAgICAgICBsZXQgcmVxdWVzdE9iamNldCA9IHRoaXMuY3VzdG9tUmVxdWVzdChwYXRoLCBvYmplY3QpO1xyXG5cclxuICAgICAgICB0aGlzLmRlZmF1bHRFbnRyeShyZXF1ZXN0T2JqY2V0LnJlcXVlc3QsIHBhdGgsIG9iamVjdCk7XHJcblxyXG4gICAgICAgIHJldHVybiByZXF1ZXN0T2JqY2V0O1xyXG4gICAgfVxyXG5cclxuICAgIHN0cmFpZ2h0UmVxdWVzdChwYXRoLCBvYmplY3QpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kZWZhdWx0RW50cnkodGhpcy5jdXN0b21SZXF1ZXN0KHBhdGgsIG9iamVjdCkucmVxdWVzdCwgcGF0aCwgb2JqZWN0KVxyXG4gICAgfVxyXG5cclxuICAgIGRlZmF1bHRFbnRyeShwcm9taXNlLCBwYXRoLCBvYmplY3QpIHtcclxuICAgICAgICByZXR1cm4gcHJvbWlzZVxyXG4gICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlc3VsdCk7XHJcbiAgICAgICAgICAgIH0sICh7IGVycm9yLCByZXN1bHQgfSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLkVycm9ySGFuZGxlcihwYXRoLCBvYmplY3QsIGVycm9yLCByZXN1bHQpKTtcclxuICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY3VzdG9tUmVxdWVzdChwYXRoLCBvYmplY3QpIHsgXHJcbiAgICAgICAgaWYgKHRoaXMuc2lnblJlcXVlc3RzICYmIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdkeW5hbWljVG9rZW4nKSlcclxuICAgICAgICAgICAgb2JqZWN0LmR5bmFtaWNUb2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdkeW5hbWljVG9rZW4nKTtcclxuXHJcbiAgICAgICAgbGV0IHNvdXJjZSA9IGF4aW9zLkNhbmNlbFRva2VuLnNvdXJjZSgpLFxyXG4gICAgICAgICAgICByZXF1ZXN0ID0gYXhpb3MucG9zdChwYXRoLCBvYmplY3QsIHtcclxuICAgICAgICAgICAgICAgIGNhbmNlbFRva2VuOiBzb3VyY2UudG9rZW5cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oKHsgZGF0YSB9ID0ge30pID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLmVycm9yKVxyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IGRhdGE7XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGEucmVzdWx0O1xyXG4gICAgICAgICAgICB9LCAoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChheGlvcy5pc0NhbmNlbChlcnJvcikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyB7ZXJyb3I6ICdSZXF1ZXN0IGNhbmNlbGVkJ307XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgY2FuY2VsOiBzb3VyY2UuY2FuY2VsLFxyXG4gICAgICAgICAgICByZXF1ZXN0XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBFcnJvckhhbmRsZXIocGF0aCwgb2JqZWN0LCBlcnJvciwgcmVzdWx0KSB7XHJcbiAgICAgICAgaWYgKCFlcnJvci5jb2RlKVxyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xyXG5cclxuICAgICAgICBzd2l0Y2ggKGVycm9yLmNvZGUpIHtcclxuICAgICAgICAgICAgY2FzZSAxMDc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5EeW5hbWljQ29va2llSGFuZGxlcihwYXRoLCBvYmplY3QsIGVycm9yLCByZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIER5bmFtaWNDb29raWVIYW5kbGVyKHBhdGgsIG9iamVjdCwgZXJyb3IsIHJlc3VsdCkge1xyXG4gICAgICAgIGlmICghcmVzdWx0LmR5bmFtaWNUb2tlbilcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZHluYW1pY1Rva2VuJywgcmVzdWx0LmR5bmFtaWNUb2tlbik7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VzdG9tUmVxdWVzdChwYXRoLCBvYmplY3QpLnJlcXVlc3Q7XHJcbiAgICB9XHJcbn0iXX0=
