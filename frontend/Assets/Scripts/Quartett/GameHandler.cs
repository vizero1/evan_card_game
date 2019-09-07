using System;
using System.Collections;
using System.Collections.Generic;
using TinyRoar.Framework;
using UnityEngine;
using UnityEngine.Networking;

public class GameHandler : MonoSingleton<GameHandler>
{
    public enum RequestType
    {
        None,
        CreateGame,
        JoinGame,
        Status,
        MakeMove
    }

    public string PlayerId;
    public string GameId;
    public bool NeedStatus;

    void Start()
    {
        Events.Instance.OnGameplayStatusChange += GameplayStatusChange;
        Updater.Instance.OnUpdate += DoUpdate;
    }

    void DoUpdate()
    {
        if (NeedStatus)
        {
            DoRequest(RequestType.Status);
        }
    }

    public void DoRequest(RequestType type)
    {
        switch (type)
        {
            case RequestType.CreateGame:
                StartCoroutine(RequestCreateGame());
                break;
            case RequestType.JoinGame:
                StartCoroutine(RequestJoinGame());
                break;
            case RequestType.Status:
                StartCoroutine(RequestStatus());
                break;
            case RequestType.MakeMove:
                StartCoroutine(RequestMakeMove());
                break;
        }
    }

    void GameplayStatusChange(GameplayStatus oldMatchStatus, GameplayStatus newMatchStatus)
    {
        switch (newMatchStatus)
        {
            case GameplayStatus.GameRunning:
                break;
            case GameplayStatus.OpenCard:
                break;
        }
    }

    private IEnumerator RequestCreateGame()
    {
        var url = Config.Instance.Url + "/game";
        var formData = new List<IMultipartFormSection>();
        formData.Add(new MultipartFormFileSection("playerName", "Player 1"));

        var www = UnityWebRequest.Post(url, formData);
        yield return www.SendWebRequest();

        if (www.isNetworkError || www.isHttpError)
        {
            Debug.LogError(www.error);
        }
        else
        {
            var data = www.downloadHandler.text;
            Debug.Log(data);
            var dto = JsonUtility.FromJson<CreateGameDto>(data);
            GameId = dto.gameId;
            PlayerId = dto.playerId;
            NeedStatus = true;
            Events.Instance.GameplayStatus = GameplayStatus.GameRunning;
        }

    }

    private IEnumerator RequestJoinGame()
    {
        var url = Config.Instance.Url + "/join/" + GameId;
        var formData = new List<IMultipartFormSection>();
        formData.Add(new MultipartFormFileSection("playerName", "Player 2"));

        var www = UnityWebRequest.Post(url, formData);
        yield return www.SendWebRequest();

        if (www.isNetworkError || www.isHttpError)
        {
            Debug.LogError(www.error);
        }
        else
        {
            var data = www.downloadHandler.text;
            Debug.Log(data);
            var dto = JsonUtility.FromJson<CreateGameDto>(data);
            PlayerId = dto.playerId;
            NeedStatus = true;
            Events.Instance.GameplayStatus = GameplayStatus.GameRunning;
        }
    }

    private IEnumerator RequestMakeMove()
    {
        var url = Config.Instance.Url + "/move/" + GameId;
        var formData = new List<IMultipartFormSection>();
        formData.Add(new MultipartFormFileSection("playerName", "Player 1 hardcoded"));

        var www = UnityWebRequest.Post(url, formData);
        yield return www.SendWebRequest();

        if (www.isNetworkError || www.isHttpError)
        {
            Debug.LogError(www.error);
        }
        else
        {
            var data = www.downloadHandler.text;
            Debug.Log(data);
            var dto = JsonUtility.FromJson<MakeMoveDto>(data);
            PlayerId = dto.playerId;
            NeedStatus = true;
            Events.Instance.GameplayStatus = GameplayStatus.GameRunning;
        }
    }

    private IEnumerator RequestStatus()
    {
        Debug.Log("GetStatus");
        var url = Config.Instance.Url + "/status/" + GameId;
        var www = UnityWebRequest.Get(url);
        yield return www.SendWebRequest();

        if (www.isNetworkError || www.isHttpError)
        {
            Debug.Log(www.error);
        }
        else
        {
            var data = www.downloadHandler.text;
            Debug.Log(data);
            var dto = JsonUtility.FromJson<StatusDto>(data);
            PlayerId = dto.playerId;
            NeedStatus = true;


            var hasCardChanged = false;

            if (hasCardChanged)
            {
                Events.Instance.GameplayStatus = GameplayStatus.OpenCard;
            }

            yield return new WaitForSeconds(2);
            DoRequest(RequestType.Status);
            //StartCoroutine(DoStatus());

        }
    }

}
