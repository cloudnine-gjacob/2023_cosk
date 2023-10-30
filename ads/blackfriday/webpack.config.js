import webpack from "webpack";
import path from "path";

export default (ad, args) => {
  const head = ad.id.split("_")[2]
  return {
    plugins: [
      new webpack.DefinePlugin({
        LOCALE_ASSET_RGX: new RegExp(`${ad.format}_global|${ad.format}_${head}|${ad.format}_${ad.productRgx}`),
      }),
    ],
  };
};
