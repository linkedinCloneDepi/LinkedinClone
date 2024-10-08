import styled from "styled-components";
import Leftside from "../components/Leftside";
import Main from "../components/Main";
import Rightside from "../components/Rightside";

const Home = () => {
  return (
    <Container>
      <Layout >
        <Leftside />
        <Main />
        <Rightside />
      </Layout>
    </Container>
  );
};
const Container = styled.div`
  padding-top: 52px;
  max-width: 70%;
  margin:auto;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const Content = styled.div`
  max-width: 1128px;
  margin-left: auto;
  margin-right: auto;
`;


const Section = styled.section`
  min-height: 50px;
  padding: 16px 0;
  box-sizing: content-box;
  text-align: center;
  text-decoration: underline;
  display: flex;
  justify-content: center;
  h5 {
    color: #0a66c2;
    font-size: 14px;
    a {
      font-weight: 700;
    }
  }

  p {
    font-size: 14px;
    color: #434649;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 0 5px;
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-areas: "leftside main rightside";
  grid-template-columns: minmax(0, 5fr) minmax(0, 12fr) minmax(300px, 7fr);
  column-gap: 25px;
  row-gap: 25px;
  /* grid-template-row: auto; */
  margin: 25px 0;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    padding: 0 5px;
  }
`;

export default Home;