export const getCookie = (name: string) => {
  console.log(document.cookie)
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
  return null;
}
