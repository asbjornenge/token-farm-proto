import assert from 'assert'
import { Farm } from '../farm.js'

describe('Rate', function() {
  it('Should be possible to adjust reward rate of the farm', function() {
    const TOTAL_REWARDS = 1000
    const REWARDS_BLOCK = 10
    const f = new Farm(TOTAL_REWARDS, REWARDS_BLOCK)
    f.start()

    f.level =   0; f.stake("user1", 1000)
    f.level =  50; f.stake("user2", 1000)
    assert(f.details.endLevel == 100)
    f.level =  50; f.setRate(20)
    assert(f.details.endLevel == 75)
    f.level = 60; f.claim("user2")
    f.level = 75; f.claim("user1"); f.claim("user2")

    assert(f.stakers.user1.paid == 750)
    assert(f.stakers.user2.paid == 250)
    const totalPaid = Object.values(f.stakers).reduce((tp, u) => tp+=u.paid,0)
    assert(totalPaid == TOTAL_REWARDS)

  })
})
