export async function logoutUser(): Promise<void> {
  localStorage.removeItem('cmd_auth_session')
  localStorage.removeItem('cmd_mobile_auth_cache')
}
