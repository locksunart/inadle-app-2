import { createClient } from '@supabase/supabase-js';
import { calculateDistance, estimateTravelTime } from '../utils/locationCalculator';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('Supabase config:', { 
  url: supabaseUrl ? 'Set' : 'Missing', 
  key: supabaseAnonKey ? 'Set' : 'Missing'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database helper functions
export const dbHelpers = {
  // 장소 관련
  async getPlaces(filters = {}) {
    let query = supabase
      .from('places')
      .select(`
        *,
        place_details(*),
        place_amenities(*),
        place_filter_scores(*),
        place_age_suitability(*)
      `)
      .eq('is_active', true);

    // 지역 필터
    if (filters.region) {
      query = query.eq('region', filters.region);
    }

    // 카테고리 필터
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    // 에너지 필터 적용
    if (filters.parentEnergy === '낮음') {
      query = query.gte('place_filter_scores.parent_energy_required', 4.0);
    }

    if (filters.childCondition === '저조함') {
      query = query.gte('place_filter_scores.child_energy_consumption', 3.5);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching places:', error);
      return [];
    }
    
    return data || [];
  },

  // 장소 상세 정보
  async getPlaceById(id) {
    const { data, error } = await supabase
      .from('places')
      .select(`
        *,
        place_details(*),
        place_amenities(*),
        place_filter_scores(*),
        place_age_suitability(*),
        place_blog_mentions(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching place:', error);
      return null;
    }

    return data;
  },

  // 행사 관련
  async getEvents(filters = {}) {
    let query = supabase
      .from('events')
      .select(`
        *,
        event_organizers(*),
        places(*)
      `)
      .eq('status', 'upcoming')
      .order('start_date', { ascending: true });

    // 연령 필터
    if (filters.targetAge) {
      query = query
        .lte('target_age_min', filters.targetAge)
        .gte('target_age_max', filters.targetAge);
    }

    // 주최기관 필터
    if (filters.organizerCategory) {
      query = query.eq('event_organizers.category', filters.organizerCategory);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }
    
    return data || [];
  },

  // 사용자 프로필
  async getUserProfile(userId) {
    console.log('dbHelpers.getUserProfile called with:', userId);
    
    // 프로필 가져오기
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    console.log('Profile query result:', { profileData, profileError });

    if (profileError && profileError.code !== 'PGRST116') { // 데이터 없음 에러 제외
      console.error('Error fetching user profile:', profileError);
    }

    // 자녀 정보 별도로 가져오기
    const { data: childrenData, error: childrenError } = await supabase
      .from('user_children')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    console.log('Children query result:', { childrenData, childrenError });

    if (childrenError) {
      console.error('Error fetching children:', childrenError);
    }

    // 프로필이 있으면 자녀 정보 추가
    if (profileData) {
      const result = {
        ...profileData,
        user_children: childrenData || []
      };
      console.log('Returning profile:', result);
      return result;
    }

    console.log('No profile found, returning null');
    return null;
  },

  // 사용자 프로필 생성/업데이트
  async upsertUserProfile(userId, profileData) {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id' // user_id 충돌 시 update로 처리
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting user profile:', error);
      throw error;
    }

    return data;
  },

  // 자녀 정보 추가
  async addChild(userId, childData) {
    const { data, error } = await supabase
      .from('user_children')
      .insert({
        user_id: userId,
        ...childData
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding child:', error);
      throw error;
    }

    return data;
  },

  // 장소 찜하기
  async toggleSavePlace(userId, placeId) {
    try {
      // 먼저 이미 찜했는지 확인
      const { data: existing, error: checkError } = await supabase
        .from('user_saved_places')
        .select('id')
        .eq('user_id', userId)
        .eq('place_id', placeId)
        .maybeSingle(); // single() 대신 maybeSingle() 사용

      if (checkError) {
        console.error('Error checking saved place:', checkError);
        return false;
      }

      if (existing) {
        // 이미 찜한 경우 삭제
        const { error } = await supabase
          .from('user_saved_places')
          .delete()
          .eq('id', existing.id);

        if (error) {
          console.error('Error deleting saved place:', error);
          return false;
        }
        return true;
      } else {
        // 찜하지 않은 경우 추가
        const { error } = await supabase
          .from('user_saved_places')
          .insert({
            user_id: userId,
            place_id: placeId
          });

        if (error) {
          console.error('Error inserting saved place:', error);
          return false;
        }
        return true;
      }
    } catch (error) {
      console.error('Error in toggleSavePlace:', error);
      return false;
    }
  },

  // 찜한 장소 목록
  async getSavedPlaces(userId) {
    const { data, error } = await supabase
      .from('user_saved_places')
      .select(`
        *,
        places(
          *,
          place_details(*),
          place_amenities(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved places:', error);
      return [];
    }

    return data || [];
  },

  // 방문 기록 추가
  async addVisit(visitData) {
    const { data, error } = await supabase
      .from('user_visits')
      .insert(visitData)
      .select()
      .single();

    if (error) {
      console.error('Error adding visit:', error);
      throw error;
    }

    return data;
  },

  // 사용자 위치 업데이트
  async updateUserLocation(userId, lat, lng, address = null) {
    try {
      // 먼저 프로필이 있는지 확인
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      let result;
      
      if (existingProfile) {
        // 프로필이 있으면 업데이트
        const { data, error } = await supabase
          .from('user_profiles')
          .update({
            home_lat: lat,
            home_lng: lng,
            home_address: address,
            home_location: `POINT(${lng} ${lat})`,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // 프로필이 없으면 생성
        const { data, error } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            home_lat: lat,
            home_lng: lng,
            home_address: address,
            home_location: `POINT(${lng} ${lat})`
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return result;
    } catch (error) {
      console.error('Error updating user location:', error);
      throw error;
    }
  },

  // 사용자 위치 기반 장소 가져오기
  async getPlacesWithDistance(userId, filters = {}) {
    let query = supabase
      .from('places_with_distance')
      .select('*')
      .eq('user_id', userId);

    // 거리 필터
    if (filters.maxDistance) {
      query = query.lte('distance_km', filters.maxDistance);
    }

    // 시간 필터 (분 단위)
    if (filters.maxTravelTime) {
      query = query.lte('travel_time_car', filters.maxTravelTime);
    }

    // 기존 필터들도 적용
    if (filters.region) {
      query = query.eq('region', filters.region);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.parentEnergy === '낮음') {
      query = query.gte('parent_energy_required', 4.0);
    }

    if (filters.childCondition === '저조함') {
      query = query.gte('child_energy_consumption', 3.5);
    }

    // 거리순 정렬
    query = query.order('distance_km', { ascending: true });

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching places with distance:', error);
      return [];
    }
    
    // place_details, place_amenities 등을 별도로 가져오기
    if (data && data.length > 0) {
      const placeIds = data.map(p => p.id);
      
      // 상세 정보 가져오기
      const [details, amenities, filterScores, ageSuitability] = await Promise.all([
        supabase.from('place_details').select('*').in('place_id', placeIds),
        supabase.from('place_amenities').select('*').in('place_id', placeIds),
        supabase.from('place_filter_scores').select('*').in('place_id', placeIds),
        supabase.from('place_age_suitability').select('*').in('place_id', placeIds)
      ]);

      // 데이터 병합
      const placesWithDetails = data.map(place => {
        return {
          ...place,
          place_details: details.data?.find(d => d.place_id === place.id) || null,
          place_amenities: amenities.data?.find(a => a.place_id === place.id) || null,
          place_filter_scores: filterScores.data?.find(f => f.place_id === place.id) || null,
          place_age_suitability: ageSuitability.data?.filter(a => a.place_id === place.id) || []
        };
      });

      return placesWithDetails;
    }
    
    return data || [];
  }
};
