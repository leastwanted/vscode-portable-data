"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const vscode_1=require("vscode"),fs=require("fs"),path=require("path");class Utilities{static readFile(e){try{if(fs.existsSync(e))return fs.readFileSync(e,"utf-8");return}catch(e){return}}static getPackagesPath(e){var t=path.join(e,"Library","PackageCache");return fs.existsSync(t)?fs.readdirSync(t).filter(e=>fs.statSync(path.resolve(t,e)).isDirectory):[]}static join(...e){return path.join(...e)}static IsFolder(e){return fs.statSync(e).isDirectory()}static getFiles(e){return fs.existsSync(e)?fs.readdirSync(e):[]}static getProjectRootFolder(e){var t=e.fsPath.indexOf(path.sep+"Assets"+path.sep);if(-1!=t)return e.fsPath.substr(0,t+1)}static getPath(e,t){var r=e.fsPath;let a=path.resolve(r,"..",t);if(fs.existsSync(a))return vscode_1.Uri.file(a);var s=r.indexOf(path.sep+"Assets"+path.sep);if(-1!=s){var i=r.substr(0,s+1);if(t.toLowerCase().startsWith("packages")){var n=this.getPackagesPath(i);for(const e of n){var c=e.replace(/@[0-9a-zA-Z_\.-]+/,"");if(-1!=t.toLowerCase().indexOf(c.toLowerCase())){var o=t.substr(9),l=o.replace(/\\/gm,"/").indexOf("/");if(-1!=l&&(o=o.substr(l),a=path.join(i,"Library","PackageCache",e,o),fs.existsSync(a)))return vscode_1.Uri.file(a)}}}else a=path.resolve(i,t);if(fs.existsSync(a))return vscode_1.Uri.file(a)}}static translatePackagePath(e,t){var r=this.getProjectRootFolder(e);if(r){var a=t.toLocaleLowerCase();if(a.startsWith("packages")){var s=this.getPackagesPath(r);for(const e of s){var i=e.replace(/@[0-9a-zA-Z_\.-]+/,"");if(-1!=t.toLowerCase().indexOf(i.toLowerCase())){var n=t.substr(9),c=n.replace(/\\/gm,"/").indexOf("/");if(-1!=c)return n=n.substr(c),path.join(r,"Library","PackageCache",e,n)}}return path.join(r,"Library","PackageCache")}return a.startsWith("assets")?path.join(r,t):path.resolve(e.fsPath,"..",t)}return path.resolve(e.fsPath,"..",t)}static getIncludeFilesContent(e,t){let r=[];return Utilities.getIncludeFiles(e).forEach(e=>{let a=Utilities.getPath(t,e);if(!a)return;let s=Utilities.readFile(a.fsPath);s&&r.push(s)}),r}static getDocumentationInIntellisenseConfig(e,t){if(e){var r=t.Items[e];if(r)return r.documentation}return""}static getMethodNameIfInMethodRange(e,t){if(t<0||t>e.length||!e)return;let r=1,a=-1;for(let s=t;s>0;s--){let t=e.charAt(s);if(!Utilities.IsWhiteSpace(t)&&(")"===t?r++:"("===t&&r--,0==r)){a=s;break}}if(-1===a)return;let s=e.substring(0,a).trim(),i=-1;for(let e=a-1;e>0;e--){let t=s.charAt(e);if(Utilities.IsWhiteSpace(t)||"="===t||"("===t||","===t||";"===t){i=e;break}}return-1!==i?s.substring(i+1,a):void 0}static getFirstNonSpaceCharInvInText(e,t){if(!(t<0||t>e.length)&&e)for(let r=t;r>0;r--){let t=e.charAt(r);if(!Utilities.IsWhiteSpace(t))return t}}static getFirstNonSpaceTexInv(e,t){var r=e.lineAt(t.line).text;for(let a=t.character-1;a>0;a--){let s=r.charAt(a);if(!Utilities.IsWhiteSpace(s))return e.getText(e.getWordRangeAtPosition(new vscode_1.Position(t.line,a)))}}static getSecondNonSpaceTexInv(e,t){var r=e.lineAt(t.line).text;let a=1;for(let s=t.character-1;s>0;s--){let i=r.charAt(s);if(!Utilities.IsWhiteSpace(i)){if(!(a>0))return e.getText(e.getWordRangeAtPosition(new vscode_1.Position(t.line,s)));{let r=e.getWordRangeAtPosition(new vscode_1.Position(t.line,s));r&&(s=r.start.character,a--)}}}}static IsWhiteSpace(e){return" "===e||"\t"===e||"\r"===e||"\n"===e}static getMethodCodeLineFromCode(e){let t=/\b[\d\w_]+?\s+?[\d\w_]+?\s*?\([\s\d\w,_]*?\)\s*?(:[\s\d\w_]+?){0,1}\s*?\{/;return Utilities.getMatchResult(t,e,"gm")}static getVariablesFromCode(e,t){let r,a=`((InputPatch|OutputPatch|RWByteAddressBuffer|RWBuffer|ConsumeStructuredBuffer|ByteAddressBuffer|Buffer|AppendStructuredBuffer|Texture2DMS|Texture2DMSArray|TextureCube|TextureCubeArray|Texture1DArray|RWTexture1DArray|RWTexture2DArray|Texture2DArray|RWTexture2D|Texture2D|StructuctedBuffer|RWStructuredBuffer|RWTexture3D|Texture3D|RWTexture1D|Texture1D)(<[\\w\\d]+?>)?)|SurfaceOutput|appdata_base|appdata_tan|appdata_full|appdata_img|sampler|sampler2D|sampler3D|samplerCUBE|string|triangle|triangleadj|vector|((float|int|uint|bool|half|fixed|double)(\\d*?|\\d*?x\\d*?))`;return r=t?`(${a}|${t})\\s+?[\\w\\d_]+?\\s*?[;)=,]`:`(${a})\\s+?[\\w\\d_]+?\\s*?[;)=,]`,Utilities.getMatchResult(new RegExp(r),e,"g")}static getStructDefinationFromCode(e){let t=/\bstruct\b\s*?[\S]*?\s*?\{[\s\S]*?\}[\s]*?;?/;return Utilities.getMatchResult(t,e,"gm")}static getPropertiesDefinationFromCode(e){let t=/[_\d\w]+?\s*?\("[\s\S]*?",[\s\S]*?\)\s*?=/;return Utilities.getMatchResult(t,e,"g")}static getIncludeDefinationFromCode(e){let t=/#include\s*?\"[\s\S]+?\"/;return Utilities.getMatchResult(t,e,"g")}static getIncludeFiles(e){let t=[],r={},a=Utilities.getIncludeDefinationFromCode(e);for(var s in a){let e=a[s];if(e){let a=e.split('"');a.length>2&&(r[a[1]]||(t.push(a[1]),r[a[1]]=1))}}return t}static getMatchResult(e,t,r){return t.match(new RegExp(e.source,r))}static getParameterInfosFromSignatureCode(e){let t=[],r=e.replace("(",",").replace(")","").split(",");if(r.length>1)for(var a=1;a<r.length;a++){let s=r[a],i=new vscode_1.ParameterInformation(e);i.label=s,t.push(i)}return t}static getMethodNameFromSignatureCode(e){let t=e.replace("("," ").split(" "),r=0;for(let e=0;e<t.length;e++)if(t[e]&&r<1)r++;else if(1===r)return t[e]}static removeEmptyEntry(e){let t=[];return e&&e.forEach(e=>{e.trim()&&t.push(e)}),t}static GetFullRangeOfDocument(e){return e.validateRange(new vscode_1.Range(0,0,Number.MAX_VALUE,Number.MAX_VALUE))}}exports.default=Utilities;