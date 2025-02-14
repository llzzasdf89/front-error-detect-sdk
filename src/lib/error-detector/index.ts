import {
    ajaxErrorDetector
} from './ajax-error-detector'
import {
    unhandledrejectionErrorDetector
} from './unhandledrejection-error-detector'
export class ErrorDetector {
    private errorCache = []
    constructor(){

    }
    init() {
        new ajaxErrorDetector();
        new unhandledrejectionErrorDetector()
    }
}