// Node 26 on this restricted Windows host cannot query the Windows account
// through os.userInfo(). tsx uses geteuid when available to name its temp dir.
if (!process.geteuid) process.geteuid = () => 0
