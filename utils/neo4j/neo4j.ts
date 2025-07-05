import types, { DateTime, Integer, Node, Session, auth, driver } from "neo4j-driver";
import { getServerSession } from "next-auth";
import { PostToDisplay } from "typings";

export function defineDriver() {
  const connectionURI = process.env.NEXT_PUBLIC_NEO4J_CONNECTION_URI!;
  const connectionUser = process.env.NEXT_PUBLIC_NEO4J_CONNECTION_USER!;
  const connectionPwd = process.env.NEXT_PUBLIC_NEO4J_CONNECTION_PWD!;
  const dr = driver(connectionURI, auth.basic(connectionUser, connectionPwd));
  return dr;
}

export async function read(session: Session, cypher = "", params = {}, alias?: string | string[] | undefined, countQuery?: string | undefined) {
  try {
    // Execute cypher statement
    const { records } = await session.run(cypher, params);

    return records.map((record) => {
      if (Array.isArray(alias)) {
        var result: { [key: string]: any[] } = {};

        for (const aIdx in alias) {
          const aKey = alias[aIdx];
          // console.log('aKey', aKey)
          const recordBasedOnAlias = record.get(aKey);
          // console.log('recordBasedOnAlias', recordBasedOnAlias)
          // console.log('recordBasedOnAlias.properties', recordBasedOnAlias.properties);
          // console.log('recordBasedOnAlias instanceof', recordBasedOnAlias instanceof Integer);

          if(recordBasedOnAlias instanceof Integer)
            result[aKey] = recordBasedOnAlias.toNumber() as any;
          else if(recordBasedOnAlias instanceof DateTime)
            result[aKey] = convertDateToDisplay(recordBasedOnAlias);
          else if (typeof recordBasedOnAlias === 'object')
            result[aKey] = recordBasedOnAlias && Array.isArray(recordBasedOnAlias) && recordBasedOnAlias.length ? recordBasedOnAlias.map((r: Node) => r.properties) : recordBasedOnAlias.properties ?? [];
          else
            result[aKey] = recordBasedOnAlias;
        }

        return result;
      }
      return alias === 'total' ? record.get(alias).toNumber() : record.get(alias ?? "u").properties
    });
  } catch (error) {
    console.log('alias', alias)

    console.log("ERror:", error);
  } finally {
    console.log("Successfully Read Data");
    // await session.close();
  }
}

export async function write(session: Session, cypher = "", params = {}) {
  try {
    await session.run(cypher, params);
  } catch (error) {
    console.log("ERROR:", error);
  } finally {
    console.log("Successfully Write Data");
  }
}


export async function getUserIdFromSession(session: Session) {
    const userAuthSession = await getServerSession();
    // console.log('session.user:', userAuthSession?.user)
    if(!userAuthSession?.user || !userAuthSession?.user?.email)
      throw new Error('Can\'t perform this request without being logged in.');
      
    const sessionUserResponse = await read(
      session,
      `
        MATCH (user:User {email: $email})
        WITH user.id as id
        RETURN id
      `,
      { email: userAuthSession?.user?.email },
      ["id"]
    );

    const { id }: any = sessionUserResponse && sessionUserResponse.length ? sessionUserResponse[0] : undefined;

    return id;
}


export function convertDateToDisplay(neo4jDateTime: any) {

  if(!neo4jDateTime.year) {
    return neo4jDateTime;
  }
  // Convert to JS Date CORRECTLY
  const dateObj = new types.DateTime(
    neo4jDateTime.year.low ?? neo4jDateTime.year.high,
    neo4jDateTime.month.low ?? neo4jDateTime.month.high,
    neo4jDateTime.day.low ?? neo4jDateTime.day.high,
    neo4jDateTime.hour.low ?? neo4jDateTime.hour.high,
    neo4jDateTime.minute.low ?? neo4jDateTime.minute.high,
    neo4jDateTime.second.low ?? neo4jDateTime.second.high,
    neo4jDateTime.nanosecond.low ?? neo4jDateTime.nanosecond.high,
    neo4jDateTime.timeZoneOffsetSeconds?.low ?? neo4jDateTime.timeZoneOffsetSeconds.high
  );

  const jsDate: Date = dateObj.toStandardDate();

  return jsDate;
}

export function shortenText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}
