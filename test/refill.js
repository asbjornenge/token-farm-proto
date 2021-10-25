import assert from 'assert'
import { Farm } from '../farm.js'

describe('Refill', function() {
  it('Should be possible to refill the farm', function() {
    const TOTAL_REWARDS    = 1000
    const REFILL_REWARDS_1 = 100
    const REFILL_REWARDS_2 = 100
    const REWARDS_BLOCK    = 10
    const f = new Farm(TOTAL_REWARDS, REWARDS_BLOCK)
    f.start()

    f.level =   0; f.stake("user1", 1000)
    f.level =   0; f.stake("user2", 1000)
    f.level =  20; f.claim("user1");
    assert(f.stakers.user1.paid == 100)
    f.level =  50; f.refill(REFILL_REWARDS_1)
    assert(f.details.endLevel == 110)

    f.level = 110; f.claim("user1"); f.claim("user2")
    assert(f.stakers.user1.paid == 550)
    assert(f.stakers.user2.paid == 550)

    f.level = 110; f.refill(REFILL_REWARDS_2)
    assert(f.details.endLevel == 120)
    f.level = 120; f.claim("user1");f.claim("user2")
    assert(f.stakers.user1.paid == 600)
    assert(f.stakers.user2.paid == 600)

    const totalPaid = Object.values(f.stakers).reduce((tp, u) => tp+=u.paid,0)
    assert(totalPaid == TOTAL_REWARDS+REFILL_REWARDS_1+REFILL_REWARDS_2)
  })

//  it('It will remember owed rewards when refilled even if farm runs empty', function() {
//    // NOTE! Make delayed refilling a separate test! 
//  })
})
