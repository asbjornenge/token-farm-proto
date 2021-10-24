class Farm {
  constructor(rewards, rewardPerBlock) {
    this.balances = {}
    this.details = {
      rewards: rewards,
      rewardPerBlock: rewardPerBlock,
      endLevel: 0,
      totalStaked: 0,
      totalStakedLevel: {0: 0},
      rewardsDistributed: 0
    }
    this.level = 0
  }

  start() {
    this.details.endLevel = this.details.rewards / this.details.rewardPerBlock
  }

  stake(address, amount) {
    if (!this.balances[address]) this.balances[address] = {
      balance: 0,
      rewards: 0,
      paid: 0,
      lastLevelPaid: this.level,
    }
    this.details.totalStaked += amount
    this.balances[address].balance += amount
    this.details.totalStakedLevel[this.level] = this.details.totalStaked
  }

  findTotalStakedAtLevel(level) {
    let levels = Object.keys(this.details.totalStakedLevel)
    let totalStakeLevel = levels.reduce((foundLevel, l) => {
      if (l <= level) return l
      return foundLevel
    },0)
    return this.details.totalStakedLevel[totalStakeLevel]
  }

  claim(address, debug=false) {
    let user = this.balances[address]

    // Make sure we don't pay for level user.lastLevelPaid twice!
    let claimLevel = this.level
    if (claimLevel > this.details.endLevel) claimLevel = this.details.endLevel
    let rewards = 0
    for (let level = user.lastLevelPaid; level < claimLevel; level++) {
      let tsl = this.findTotalStakedAtLevel(level)
      let rwt = this.details.rewardPerBlock / tsl
      let rewardToUser = user.balance * rwt 
      rewards += rewardToUser
      this.details.rewards -= rewardToUser
    }
    user.paid += rewards
    user.lastLevelPaid = this.level
    user.rewards = 0 
  }
}

const f = new Farm(10000, 100)
f.start()
f.stake("user1", 1000)
f.level = 5
f.stake("user2", 1000)
f.level = 50
f.claim("user1")
f.level = 100
f.claim("user2")
f.claim("user1")

console.log(f.balances)
console.log(Object.values(f.balances).reduce((tp, u) => tp+=u.paid,0))
