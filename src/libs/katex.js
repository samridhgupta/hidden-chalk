import katex from 'katex';
import replaceAll from './replaceAll';
export default {
    render(text, option) {
        return replaceAll(text, /(\$\$([^$\s]*)\$\$)|(\$([^$\s]*)\$)/, (match, group, group2, group3, group4, index, string)=> {
            let blockDisplay = !group2 ? true : false;
            let texString = !group2 ? group4 : group2;
            return katex.renderToString(texString, { displayMode: blockDisplay, throwOnError: false });
        });
    }
}