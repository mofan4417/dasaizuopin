package com.xiangzhuqiao.service;

import com.xiangzhuqiao.model.User;
import com.xiangzhuqiao.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.util.concurrent.TimeUnit;

@Service
public class LevelService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String USER_LEVEL_CACHE = "user:level:";

    public Integer getUserLevel(Long userId) {
        String cacheKey = USER_LEVEL_CACHE + userId;
        Integer cachedLevel = (Integer) redisTemplate.opsForValue().get(cacheKey);
        
        if (cachedLevel != null) {
            return cachedLevel;
        }

        User user = userRepository.findById(userId).orElseThrow();
        redisTemplate.opsForValue().set(cacheKey, user.getLevel(), 1, TimeUnit.HOURS);
        return user.getLevel();
    }

    public void upgradeUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        if (user.getLevel() < 9) {
            user.setLevel(user.getLevel() + 1);
            userRepository.save(user);
            
            // Update cache
            redisTemplate.opsForValue().set(USER_LEVEL_CACHE + userId, user.getLevel());
            
            // Log audit
            System.out.println("User " + userId + " upgraded to level " + user.getLevel());
        }
    }
}
