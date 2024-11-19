const jsonwebtoken = require("jsonwebtoken");

const socketAuth = async (socket) => {
  try {
    const accessToken = socket.handshake.headers["authorization"];

    console.log("accessToken---->", accessToken);

    if (!accessToken) {
      socket.emit("ERROR", "cust_user_id NOT SENT");
      return;
    }

    const tokenData = await jsonwebtoken.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    if (!tokenData?.user_id) return;
    if (tokenData.exp && tokenData.exp < Date.now() / 1000) return;

    socket.data["userData"] = tokenData;
    socket.emit("MESSAGE", {
      data: socket.data.userData,
      message: "socket auth success",
      error: null,
    });

    return true;
  } catch (error) {
    socket.emit("ERROR", {
      error: error.message,
      message: "socket auth failed, user unauthorized",
    });

    return false;
  }
};

module.exports = { socketAuth };
