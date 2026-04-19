import AccountTypeChart from "@/components/AdminComponents/AccountTypeStats";
import DeviceStatsChart from "@/components/AdminComponents/DeviceStatsChart";
import LastLoginTable from "@/components/AdminComponents/LastLoginTable";
import NewVsRepeatedChart from "@/components/AdminComponents/NewVsRepeated";
import PagePopularitySmaller from "@/components/AdminComponents/PagePopularitySmaller";
import ReferrerStatsChart from "@/components/AdminComponents/ReferrerStatsChart";
import TopCountriesBarChart from "@/components/AdminComponents/TopCountriesBarChart";
import UsersActivityAreaChart from "@/components/AdminComponents/UsersActivityGraph";
import VisitorAccountPieChart from "@/components/AdminComponents/VisitorAccountPieChart";
import Layout from "@/components/Layout";

export default function Admin() {
    return (
      <Layout>
        <div className="w-[1783px] h-full">
          <div className="absolute left-24 top-20 grid grid-cols-3 gap-10 w-[100%]">
            <UsersActivityAreaChart />
            <PagePopularitySmaller />
            <TopCountriesBarChart />
          </div>
        </div>
      </Layout>
    );
}