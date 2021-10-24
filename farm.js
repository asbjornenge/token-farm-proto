export class Farm {
  constructor(rewards, rewardPerBlock) {
    this.stakers = {}
    this.details = {
      rewards: rewards,
      rewardPerBlock: rewardPerBlock,
      endLevel: 0,
      totalStaked: 0,
      totalStakedLevel: {0:0},
      rewardsDistributed: 0
    }
    this.level = 0
  }

  start() {
    this.details.endLevel = this.details.rewards / this.details.rewardPerBlock
  }

  stake(address, amount) {
    if (!this.stakers[address]) this.stakers[address] = {
      balance: 0,
      balanceLevel: {0:0},
      rewards: 0,
      paid: 0,
      lastLevelPaid: this.level,
    }
    this.stakers[address].balance += amount
    this.stakers[address].balanceLevel[this.level] = this.stakers[address].balance
    this.details.totalStaked += amount
    this.details.totalStakedLevel[this.level] = this.details.totalStaked
  }

  findAtLevel(level, _map) {
    let levels = Object.keys(_map)
    let totalStakeLevel = levels.reduce((foundLevel, l) => {
      if (l < level) return l
      return foundLevel
    },0)
    return _map[totalStakeLevel]
  }

  claim(address, debug=false) {
    let user = this.stakers[address]

    let claimLevel = this.level
    if (claimLevel > this.details.endLevel) claimLevel = this.details.endLevel
    let rewards = 0
    for (let level = user.lastLevelPaid+1; level <= claimLevel; level++) {
      let tsl = this.findAtLevel(level, this.details.totalStakedLevel)
      let rwt = this.details.rewardPerBlock / tsl
      let bal = this.findAtLevel(level, user.balanceLevel)
      let rewardToUser = bal * rwt 
      //console.log(address,level,tsl,rwt,bal,rewardToUser)
      rewards += rewardToUser
      this.details.rewards -= rewardToUser
    }
    user.paid += rewards
    user.lastLevelPaid = claimLevel 
    user.rewards = 0 
  }
}

//const TOTAL_REWARDS = 10000
//const REWARDS_BLOCK = 100
//const f = new Farm(TOTAL_REWARDS, REWARDS_BLOCK)
//f.start()
//
//f.level =  0; f.stake("user1", 1000)
//f.level = 10; f.stake("user1", 3000)
//f.level = 50; f.stake("user2", 1000)
//f.level = 100
//f.claim("user1")
//f.claim("user2")
//console.log(f.stakers)
