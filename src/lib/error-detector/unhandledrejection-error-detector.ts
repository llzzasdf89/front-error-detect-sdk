type listenerFunction = (event:PromiseRejectionEvent) => void;
interface keyValueObject  {
    key:string,
    value:unknown
}
enum source {
    fetch = 'fetch',
    promise = 'promise'
}
interface ErrorCache {
    [id:string]: {
        reason: unknown,
        promise:Promise<PromiseRejectionEvent>,
        date:number,
        source:source,
        id:string
    }
}
function _defineUnWriteAblePropertyOnTarget(targetObject:Error,keyValueObjectArray:Array<keyValueObject>):void {
    //for es6 
    if(window.Reflect && typeof window.Reflect === 'function') {
        for(const item of keyValueObjectArray) {
            window.Reflect.defineProperty(targetObject, item.key, {
                value:item.value,
                writable:false,
                enumerable:false,
                configurable:false
            })
        }
        return ;
    }
    //for es5
    for(const item of keyValueObjectArray) {
        Object.defineProperty(targetObject, item.key, {
            value:item.value,
            writable:false,
            enumerable:false,
            configurable:false
        })
    }
}
export class unhandledrejectionErrorDetector {
    private static instance:unhandledrejectionErrorDetector | null = null;
    private static listenerCache:listenerFunction | null = null;
    private static errorCache:ErrorCache = {

    }
    constructor(){
        if (!unhandledrejectionErrorDetector.instance) {
            unhandledrejectionErrorDetector.instance = this;
        }
        this._init()
        return unhandledrejectionErrorDetector.instance;
    }
    _init() {
        this._overrideOriginFetch()
        this._startListener()
    }
    _overrideOriginFetch() {
        //return if origin fetch is not found in window object
        if(!window.fetch || typeof window.fetch !== 'function') return ;
        const originFetch = window.fetch;
        window.fetch = async function(input: RequestInfo | URL, config?: RequestInit | undefined):Promise<Response> {
            try {
                return await originFetch(input, config)
            }
            catch(err:unknown){
                if(err instanceof Error) {
                    _defineUnWriteAblePropertyOnTarget(err,[{
                        key:'input',
                        value:input
                    }, {
                        key:'config',
                        value:config
                    }]) 
                }
                return Promise.reject(err)
            }
        }
    }
    _startListener() {
        if(unhandledrejectionErrorDetector.listenerCache) return ;
        function listener(event:PromiseRejectionEvent) {
            const id = Math.random().toString(36).slice(2)
            unhandledrejectionErrorDetector.errorCache[id] = {
                reason:event.reason,
                promise:event.promise,
                date:Date.now(),
                source:event.reason.input && event.reason.config?source.fetch:source.promise,
                id
            }
        }
        window.addEventListener('unhandledrejection', listener)
    }
    _removeListener() {
        if(!unhandledrejectionErrorDetector.listenerCache) return ;
        window.removeEventListener('unhandledrejection', unhandledrejectionErrorDetector.listenerCache)
    }
}