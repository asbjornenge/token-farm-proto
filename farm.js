export class Farm {
  constructor(rewards, rewardPerBlock) {
    this.stakers = {}
    this.details = {
      rewards: rewards,
      rewardPerBlock: rewardPerBlock,
      rewardPerBlockLevel: {0:rewardPerBlock},
      endLevel: 0,
      totalStaked: 0,
      totalStakedLevel: {0:0}
    }
    this.level = 0
    this.startLevel = 0
  }

  start() {
    this.details.endLevel = this.level + (this.details.rewards / this.details.rewardPerBlock)
  }

  refill(amount) {
    this.details.rewards += amount 
    this.details.endLevel = this.details.endLevel + (amount / this.details.rewardPerBlock)
  }

  setRate(rewardPerBlock) {
    let claimableRewards = 0
    for (let level = this.startLevel; level < this.level; level++) {
      let rpb = this.findAtLevel(level, this.details.rewardPerBlockLevel)
      claimableRewards += rpb
    }    
    let rewardsLeftForChangedRate = this.details.rewards - claimableRewards
    this.details.endLevel = this.level + (rewardsLeftForChangedRate / rewardPerBlock)
    this.details.rewardPerBlock = rewardPerBlock
    this.details.rewardPerBlockLevel[this.level] = rewardPerBlock
  }

  stake(address, amount) {
    if (!this.stakers[address]) this.stakers[address] = {
      balanceTotal: 0,
      balanceLevel: {0:0},
      rewards: 0,
      paid: 0,
      lastLevelPaid: this.level,
    }
    let user = this.stakers[address]
    user.balanceTotal += amount
    user.balanceLevel[this.level] = user.balanceTotal
    this.details.totalStaked += amount
    this.details.totalStakedLevel[this.level] = this.details.totalStaked
  }

  unstake(address, amount) {
    let user = this.stakers[address]
    user.balanceTotal -= amount
    user.balanceLevel[this.level] = user.balanceTotal
    this.details.totalStaked -= amount
    this.details.totalStakedLevel[this.level] = this.details.totalStaked
    this.claim(address)
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
      let rpb = this.findAtLevel(level, this.details.rewardPerBlockLevel)
      let rpu = rpb / tsl
      let bal = this.findAtLevel(level, user.balanceLevel)
      let rewardToUser = bal * rpu 
      //console.log(address,level,tsl,rwt,bal,rewardToUser)
      if (this.details.rewards < rewardToUser) throw new Error('Not enough rewards for user') 
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
