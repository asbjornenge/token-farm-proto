import assert from 'assert'
import { Farm } from '../farm.js'

describe('Rewards', function() {
  it('Claim should distribute rewards fairly', function() {
    const TOTAL_REWARDS = 1000
    const REWARDS_BLOCK = 10
    const f = new Farm(TOTAL_REWARDS, REWARDS_BLOCK)
    f.start()

    f.level =   0; f.stake("user1", 1000)
    f.level =  50; f.stake("user2", 1000)
    f.level = 100; f.claim("user1"); f.claim("user2")

    assert(f.stakers.user1.paid == 750)
    assert(f.stakers.user2.paid == 250)
    const totalPaid = Object.values(f.stakers).reduce((tp, u) => tp+=u.paid,0)
    assert(totalPaid == TOTAL_REWARDS)
  })
  it('Users can stake and claim whenever they want', function() {
    const TOTAL_REWARDS = 10000
    const REWARDS_BLOCK = 100
    const f = new Farm(TOTAL_REWARDS, REWARDS_BLOCK)
    f.start()

    f.level =   0; f.stake("user1", 1000)
    f.level =  10; f.stake("user1", 2000); f.claim("user1")
    f.level =  50; f.stake("user2", 1000); f.unstake("user1", 2000)
    f.level = 100; f.claim("user1"); f.claim("user2")

    assert(f.stakers.user1.paid == 7500)
    assert(f.stakers.user2.paid == 2500)
    const totalPaid = Object.values(f.stakers).reduce((tp, u) => tp+=u.paid,0)
    assert(totalPaid == TOTAL_REWARDS)
  })
})
