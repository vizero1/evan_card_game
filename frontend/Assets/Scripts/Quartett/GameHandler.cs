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

    public string PlayerId { get; private set; }
    public string GameId { get; private set; }
    public bool NeedStatus { get; private set; }
    public bool HasOpponent { get; private set; }
    public bool MyTurn { get; private set; }
    public CardDto CurrentCard { get; private set; }
    private int _statusRequestInterval = 20;

    void Start()
    {
        Events.Instance.OnGameplayStatusChange += GameplayStatusChange;
        Updater.Instance.OnUpdate += DoUpdate;
    }

    protected override void OnDestroy()
    {
        Events.Instance.OnGameplayStatusChange -= GameplayStatusChange;
        Updater.Instance.OnUpdate -= DoUpdate;
    }

    void DoUpdate()
    {
    }

    public void MakeMove(int id)
    {
        StartCoroutine(RequestMakeMove(id));
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
            Debug.Log("CreateGame Reponse: " + data);
            var dto = JsonUtility.FromJson<CreateGameDto>(data);
            GameId = dto.gameId;
            PlayerId = dto.playerId;
            CreateJoinGameSuccessful();
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
            Debug.Log("JoinGame Reponse: " + data);
            var dto = JsonUtility.FromJson<CreateGameDto>(data);
            PlayerId = dto.playerId;
            CreateJoinGameSuccessful();
        }
    }

    private void CreateJoinGameSuccessful()
    {
        NeedStatus = true;
        Events.Instance.GameplayStatus = GameplayStatus.GameRunning;
        DoRequest(RequestType.Status);
        UIManager.Instance.Switch(Layer.Main, UIAction.Hide, 0);
        UIManager.Instance.Switch(Layer.Ingame, UIAction.Show, 0);
    }

    private IEnumerator RequestMakeMove(int attributeId)
    {
        var url = Config.Instance.Url + "/move/" + GameId;
        var formData = new List<IMultipartFormSection>();
        formData.Add(new MultipartFormFileSection("playerId", PlayerId));
        formData.Add(new MultipartFormFileSection("attribute", attributeId.ToString()));

        var www = UnityWebRequest.Post(url, formData);
        yield return www.SendWebRequest();

        if (www.isNetworkError || www.isHttpError)
        {
            Debug.LogError(www.error);
        }
        else
        {
            var data = www.downloadHandler.text;
            Debug.Log("MakeMove Reponse: " + data);
            var dto = JsonUtility.FromJson<MakeMoveDto>(data);
            var hasWon = dto.hasWon;

            // ToDo check hasWon 

            NeedStatus = true;
            Events.Instance.GameplayStatus = GameplayStatus.GameRunning;
        }
    }

    private IEnumerator RequestStatus()
    {
        Debug.Log("Run Request GetStatus");
        var url = Config.Instance.Url + "/status/" + GameId + "?playerId=" + PlayerId;
        var www = UnityWebRequest.Get(url);
        yield return www.SendWebRequest();

        if (www.isNetworkError || www.isHttpError)
        {
            Debug.Log(www.error);
        }
        else
        {
            var data = www.downloadHandler.text;
            Debug.Log("GetStatus Reponse: " + data);
            var dto = JsonUtility.FromJson<StatusDto>(data);

            var hasChanged = false;
            if (dto.hasOpponent)
            {
                if (HasOpponent == false)
                {
                    HasOpponent = true;
                    hasChanged = true;
                    MyTurn = dto.myTurn;
                    if (!MyTurn)
                    {
                        NeedStatus = true;
                    }
                }
                else
                {
                    if (!MyTurn && dto.myTurn)
                    {
                        MyTurn = dto.myTurn;
                        hasChanged = true;
                    }
                }
                CurrentCard = dto.currenCard;

                if (hasChanged)
                {
                    if (MyTurn)
                    {
                        Events.Instance.GameplayStatus = GameplayStatus.YourTurn;

                        Timer.Instance.Add(3.0f, () =>
                        {
                            LayerManager.Instance.SetAction(Layer.PlayCards, UIAction.Show);
                        });
                    }
                    else
                    {
                        Events.Instance.GameplayStatus = GameplayStatus.OpponentTurn;
                    }

                    Timer.Instance.Add(1.0f, () =>
                    {
                        Events.Instance.GameplayStatus = GameplayStatus.GetCard;

                        Timer.Instance.Add(2.0f, () =>
                        {
                            Events.Instance.GameplayStatus = GameplayStatus.OpenCard;
                        });
                    });
                }
            }

            if (!hasChanged || !MyTurn)
            {
                yield return new WaitForSeconds(this._statusRequestInterval);
                DoRequest(RequestType.Status);
            }
        }
    }

}
