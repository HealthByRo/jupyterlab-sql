import urlparse from 'url';

export namespace ConnectionUrl {
  export function sanitize(url: string): string {
    const parsedUrl = urlparse.parse(url);
    const { auth } = parsedUrl;
    var [username, password] = auth.split(":")
    if (password && password !== '') {
      password = '•••••••';
    }
    return `${parsedUrl.protocol}//${username}:${password}@${parsedUrl.host}${parsedUrl.path}`
  }
}
