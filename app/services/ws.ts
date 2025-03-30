import { Server } from 'socket.io'
import server from '@adonisjs/core/services/server'

class Ws {
  public io!: Server
  private booted: boolean = false

  public boot() {
    if ((this, this.booted)) {
      return
    }
    this.booted = true
    this.io = new Server(server.getNodeServer())
  }
}

export default new Ws()
