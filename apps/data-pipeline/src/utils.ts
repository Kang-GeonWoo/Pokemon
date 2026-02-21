export function toId(text: any): string {
    if (text && text.id) {
        text = text.id;
    } else if (text && text.userid) {
        text = text.userid;
    }
    if (typeof text !== 'string' && typeof text !== 'number') return '';
    return ('' + text).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function safeJsonParse(str: string): any | null {
    try {
        return JSON.parse(str);
    } catch (e) {
        return null;
    }
}
