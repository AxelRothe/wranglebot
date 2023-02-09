import LogBot from "logbotjs";
import RouteResult from "../../RouteResult";

export default {
  method: 'post',
  url: '/login',
  public: true,
  handler: async (req, res, wranglebot, socketServer) =>{

    const { username, password, token } = req.body;

    if ((!username || !password) && !token) {
      return new RouteResult(
        404,
        LogBot.resolveErrorCode(400) + ": username and password are required",
      );
    }

    const client = socketServer.signInClient(username || null, password || null, token || null);

    return new RouteResult(200,
      {
        token: client.token,
        username: client.username,
        roles: client.roles,
        email: client.email,
        firstName: client.firstName,
        lastName: client.lastName,
        libraries: client.libraries,
      })
  }
}