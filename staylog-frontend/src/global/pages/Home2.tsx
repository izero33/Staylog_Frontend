import HomeListSection from "../../domain/home/components/HomeListSection";

function Home2(){

  return<>
  <HomeListSection
  title="무료 개방한 서울 궁궐 단풍 나들이"
  regionCode="REGION_BUSAN"
  sort="rating"
  limit={20}
/>
  </>
}

export default Home2;