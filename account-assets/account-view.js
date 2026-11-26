// Used only to discard stale UI work; the server verifies every authenticated request.
export function accountIdentity(token){
 if(!token)return '';
 try{const body=JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));return typeof body.sub==='string'&&body.sub?body.sub:token;}catch{return token;}
}
