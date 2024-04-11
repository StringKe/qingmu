import { RouteModule } from 'vinxi/routes';

import { get } from 'lodash-es';

import { MatchResult } from '~/lib/utils/types';

export function getRouterType(route: RouteModule) {
    return get(route, 'type', 'react') as 'react' | 'api';
}

export function matchRouter(definePath: string, path: string): MatchResult {
    // 首先解析出所有参数名
    const paramNames = definePath.match(/\/\$[a-zA-Z0-9_]+/g)?.map((name) => name.slice(2)) || [];

    // 将路由模式转换为正则表达式
    let regexPattern = definePath
        .replace(/\//g, '\\/') // 转义斜线
        .replace(/\$[a-zA-Z0-9_]+/g, '([^\\/]+)'); // 匹配 $ 后的字符，捕获参数值

    // 确保正则表达式匹配整个字符串
    regexPattern = `^${regexPattern}$`;

    // 创建正则表达式对象
    const regex = new RegExp(regexPattern);

    // 使用正则表达式匹配请求的路径
    const match = path.match(regex);

    if (match) {
        // 如果匹配成功，从匹配结果中提取参数值
        const params = paramNames.reduce(
            (acc, paramName, index) => {
                acc[paramName] = match[index + 1]; // 匹配结果中的第一个元素是整个匹配的字符串，所以参数值从索引 1 开始
                return acc;
            },
            {} as { [key: string]: string },
        );

        return { isMatch: true, params };
    } else {
        // 如果不匹配，返回 false
        return { isMatch: false };
    }
}
